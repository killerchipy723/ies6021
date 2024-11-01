const express = require('express');
const path = require('path');
const db = require('./public/db');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mysql = require('mysql2/promise');


const app = express();
const port = 3000;
 
// Middleware para servir archivos estáticos y parsear JSON
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Configuración de sesión con almacenamiento en MySQL y tiempo de expiración de una hora
const sessionStore = new MySQLStore({}, db);
app.use(
    session({
        key: 'session_cookie_name',
        secret: 'mi_secreto',
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 60 * 60 * 1000, // 1 hora de inactividad
            secure: false // Cambia a true si usas HTTPS
        }
    })
);



function verificarAutenticacion(req, res, next) {
    if (req.session.user || ['/login', '/registro', '/send-reset-email', '/reset-password', '/update-password'].includes(req.path)) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.use(verificarAutenticacion); // Aplica el middleware a todas las rutas


// Ruta para manejar el login
app.post('/login', async (req, res) => {
    const { dni, password } = req.body;

    try {
        const [user] = await db.query(
            'SELECT * FROM alumno WHERE (dni = ? OR correo = ?) AND clave = ?',
            [dni, dni, password]
        );

        if (user.length > 0) {
            req.session.user = {
                idalumno: user[0].idalumno,
                dni: user[0].dni,
                correo: user[0].correo,
                nombres: user[0].nombres,
                apellidos: user[0].apellidos
            };

            const nombreCompleto = `${user[0].apellidos}, ${user[0].nombres}`;
            return res.status(200).json({ success: true, nombreCompleto });
        } else {
            return res.status(401).json({ success: false, message: 'DNI o contraseña incorrectos.' });
        }
    } catch (error) {
        console.error('Error en la autenticación:', error);
        return res.status(500).json({ message: 'Error en la autenticación' });
    }
});

// Ruta protegida para obtener datos del alumno
app.get('/datos-alumno',  (req, res) => {
    const { idalumno } = req.session.user;

    const query = 'SELECT idalumno, apellidos, nombres, dni, cuil, localidad, telefono FROM alumno WHERE idalumno = ?';
    db.query(query, [idalumno])
        .then(([rows]) => {
            if (rows.length > 0) {
                res.json(rows[0]);
            } else {
                res.status(404).json({ error: 'Alumno no encontrado' });
            }
        })
        .catch(err => {
            console.error('Error al obtener datos del alumno:', err);
            res.status(500).json({ error: 'Error en el servidor' });
        });
});

// Ruta protegida para mostrar el nombre del alumno que se logueó
app.get('/portada', verificarAutenticacion, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'portada.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Ruta protegida para obtener las carreras activas
app.get('/carreras', verificarAutenticacion, async (req, res) => {
    const query = "SELECT idcarrera, nombre, tipo, duracion, estado FROM carreras WHERE estado = 'Activo'";

    try {
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error('Error al obtener las carreras:', err);
        res.status(500).json({ error: 'Error al obtener las carreras' });
    }
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
    // Destruir la sesión en el servidor
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error al cerrar la sesión');
        }

        // Limpiar cookies específicas en el cliente
        res.clearCookie('connect.sid'); // Cambia 'connect.sid' al nombre de tu cookie de sesión si es diferente

        // Redirigir al usuario a la página de inicio de sesión
        res.redirect('/login');
    });
});


// Ruta para restablecimiento de contraseña
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ies6.021jc@gmail.com',
        pass: 'scen eflk jshw dwsq'
    }
});

app.post('/send-reset-email', async (req, res) => {
    const { dni, email } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM alumno WHERE dni = ? AND correo = ?', [dni, email]);

        // Verificar si no se encontró ningún usuario
        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No se encontró un usuario con ese DNI y correo electrónico.' });
        }

        // Si existe el usuario, seleccionamos el primer elemento
        const user = users[0];

        // Generar el token y actualizar en la base de datos
        const token = crypto.randomBytes(20).toString('hex');
        await db.query('UPDATE alumno SET reset_token = ?, reset_token_expires = ? WHERE idalumno = ?', 
            [token, new Date(Date.now() + 3600000), user.idalumno]);

        // Configurar el mensaje para el correo electrónico
        const message = {
            text: `Aquí está el enlace para restablecer su contraseña: http://181.89.27.48:3000/reset-password?token=${token}`,
            from: 'ies6.021jc@gmail.com',
            to: email,
            subject: 'Restablecimiento de Contraseña'
        };

        // Enviar el correo
        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.error('Error al enviar el correo:', err);
                return res.status(500).json({ message: 'Error al enviar el correo electrónico.' });
            }
            return res.status(200).json({ message: 'Se ha enviado un enlace de restablecimiento de contraseña a su correo electrónico.' });
        });
    } catch (error) {
        console.error('Error al enviar el correo de restablecimiento:', error);
        res.status(500).json({ message: 'Error al procesar la solicitud de restablecimiento.' });
    }
});



// Ruta para restablecer la contraseña
app.get('/reset-password', async (req, res) => {
    const { token } = req.query;

    const [user] = await db.query('SELECT * FROM alumno WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);

    if (user.length === 0) {
        return res.status(400).json({ message: 'Token inválido o expirado.' });
    }

    res.sendFile(path.join(__dirname, 'public', 'restablecerClave.html'));
});

// Ruta para actualizar la contraseña
app.post('/update-password', async (req, res) => {
    const { token, new_password, confirm_password } = req.body;

    if (new_password !== confirm_password) {
        return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
    }

    const [user] = await db.query('SELECT * FROM alumno WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);

    if (user.length === 0) {
        return res.status(400).json({ message: 'Token inválido o expirado.' });
    }

    await db.query('UPDATE alumno SET clave = ?, reset_token = NULL, reset_token_expires = NULL WHERE idalumno = ?', [new_password, user[0].idalumno]);

    return res.status(200).json({ message: 'Contraseña Actualizada con Exito' });
});

// Ruta para manejar el registro de usuarios
app.post('/registro', async (req, res) => {
    let { dni1, cuil, apellidos, nombres, fechanac, localidad, correo, telefono, clave1, clave2 } = req.body;

    if (!dni1 || !correo) {
        return res.status(400).json({ message: 'DNI y correo son obligatorios.' });
    }

    if (clave1 !== clave2) {
        return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
    }

    dni1 = dni1.toString().trim();

    try {
        const [existingStudents] = await db.query('SELECT * FROM alumno WHERE dni = ?', [dni1]);

        if (existingStudents.length > 0) {
            return res.status(400).json({ message: 'El Alumno ya se encuentra registrado.' });
        }

        await db.query(
            'INSERT INTO alumno (dni, cuil, apellidos, nombres, fechanac, localidad, correo, telefono, clave) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [dni1, cuil, apellidos, nombres, fechanac, localidad, correo, telefono, clave1]
        );

        res.status(200).json({ message: 'Registro exitoso', success: true });
    } catch (error) {
        console.error('Error al insertar datos:', error);
        res.status(500).json({ message: 'Error al insertar datos en la base de datos.' });
    }
});


app.listen(port, '0.0.0.0',() => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

process.on('SIGTERM', () => {
    console.log('Recibida señal de cierre, manteniendo el servidor activo.');
});
