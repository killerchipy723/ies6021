const express = require('express'); 
const path = require('path');
const db = require('./public/db'); // Importar la conexión a la base de datos
const session = require('express-session'); // Para manejo de sesión
const nodemailer = require('nodemailer'); // O emailjs, según lo que prefieras
const crypto = require('crypto');
const mysql = require('mysql2/promise'); 

const app = express();
const port = 3000;

// Middleware para servir archivos estáticos y parsear JSON
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesión
app.use(session({
    secret: 'mi_secreto',
    resave: false, 
    saveUninitialized: true,
    cookie: { secure: false } // Cambiar a true en HTTPS
}));

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
            const nombreCompleto = `${user[0].apellidos} ${user[0].nombres}`;
            return res.status(200).json({ success: true, nombreCompleto });
        } else {
            return res.status(401).json({ success: false, message: 'DNI o contraseña incorrectos.' });
        }
    } catch (error) {
        console.error('Error en la autenticación:', error);
        return res.status(500).json({ message: 'Error en la autenticación' });
    }
});


// Ruta para mostrar el nombre del alumno que se logueo
app.get('/portada', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirigir al login si no está autenticado
    }

    // Enviar el nombre completo al renderizar la página
    const nombreCompleto = `${req.session.user.apellidos} ${req.session.user.nombres}`;
    res.render('portada', { nombreCompleto });
});

//Tabla carreras en propuestas academicas - portada

app.get('/carreras', async (req, res) => {
    const query = "SELECT idcarrera, nombre, tipo, duracion, estado FROM carreras where estado = 'Activo'";

    try {
        const [results] = await db.query(query); // No necesitas db.promise() aquí
        res.json(results);
    } catch (err) {
        console.error('Error al obtener las carreras:', err);
        res.status(500).json({ error: 'Error al obtener las carreras' });
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error al cerrar la sesión');
        }
        res.redirect('/login');
    });
});


// Ruta para manejar la solicitud de restablecimiento de contraseña
const transporter = nodemailer.createTransport({
    service: 'gmail', // Cambia esto si usas otro servicio de correo
    auth: {
        user: 'ies6.021jc@gmail.com', // Tu dirección de correo
        pass: 'scen eflk jshw dwsq', // Tu contraseña (o contraseña de aplicación si usas 2FA)
    },
});

// Ruta para enviar el correo de restablecimiento de contraseña
app.post('/send-reset-email', async (req, res) => {
    const { dni, email } = req.body;

    try {
        // Buscar el usuario en la base de datos
        const [user] = await db.query('SELECT * FROM alumno WHERE dni = ? AND correo = ?', [dni, email]);

        if (user.length === 0) {
            return res.status(404).json({ message: 'No se encontró un usuario con ese DNI y correo electrónico.' });
        }

        // Generar un token de restablecimiento
        const token = crypto.randomBytes(20).toString('hex');

        // Guardar el token y la fecha de expiración de 1 hora
        await db.query('UPDATE alumno SET reset_token = ?, reset_token_expires = ? WHERE idalumno = ?', [token, new Date(Date.now() + 3600000), user[0].idalumno]);

        // Enviar correo electrónico
        const message = {
            text: `Aquí está el enlace para restablecer su contraseña: http://181.89.27.48:3000/reset-password?token=${token}`,
            from: 'ies6.021jc@gmail.com', // Cambia esto por tu dirección de correo
            to: email,
            subject: 'Restablecimiento de Contraseña',
        }; 

        // Envía el correo usando Nodemailer
        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: 'Error al enviar el correo electrónico.' });
            }
            return res.status(200).json({ message: 'Se ha enviado un enlace de restablecimiento de contraseña a su correo electrónico.' });
        });
    } catch (error) {
        console.error('Error al enviar el correo de restablecimiento:', error);
        res.status(500).json({ message: 'Error al procesar la solicitud de restablecimiento.' });
    }
});

// Ruta para manejar el restablecimiento de contraseña
app.get('/reset-password', async (req, res) => {
    const { token } = req.query;

    // Validar el token
    const [user] = await db.query('SELECT * FROM alumno WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);

    if (user.length === 0) {
        return res.status(400).json({ message: 'Token inválido o expirado.' });
    }

    // Aquí puedes mostrar un formulario para restablecer la contraseña o redirigir a una página
    res.sendFile(path.join(__dirname, 'public', 'restablecerClave.html')); 
});


// Ruta para actualizar la contraseña
app.post('/update-password', async (req, res) => {
    const { token, new_password, confirm_password } = req.body;

    // Validar que las contraseñas coincidan
    if (new_password !== confirm_password) {
        return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
    }

    // Validar el token
    const [user] = await db.query('SELECT * FROM alumno WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);

    if (user.length === 0) {
        return res.status(400).json({ message: 'Token inválido o expirado.' });
    }

    // Actualizar la contraseña en la base de datos
    await db.query('UPDATE alumno SET clave = ?, reset_token = NULL, reset_token_expires = NULL WHERE idalumno = ?', [new_password, user[0].idalumno]);

    return res.status(200).json({ message: 'Contraseña Actualizada con Exito' });
    
});


// Ruta para manejar el registro
app.post('/registro', async (req, res) => {
    let { dni1, cuil, apellidos, nombres, fechanac, localidad, correo, telefono, clave1, clave2 } = req.body;

    console.log("Datos recibidos:", req.body);

    if (!dni1 || !correo) {
        console.log("El campo DNI y correo son obligatorios.");
        return res.status(400).json({ message: 'DNI y correo son obligatorios.' });
    }

    if (clave1 !== clave2) {
        console.log("Las contraseñas no coinciden.");
        return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
    }

    dni1 = dni1.toString().trim();

    try {
        const [existingStudents] = await db.query('SELECT * FROM alumno WHERE dni = ?', [dni1]);

        if (existingStudents.length > 0) {
            console.log("El alumno ya se encuentra registrado.");
            return res.status(400).json({ message: 'El alumno ya se encuentra registrado.' });
        }

        const [result] = await db.query(
            'INSERT INTO alumno (dni, cuil, apellidos, nombres, fechanac, localidad, correo, telefono, clave) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [dni1, cuil, apellidos, nombres, fechanac, localidad, correo, telefono, clave1]
        );

        console.log("Registro exitoso.");
        res.status(200).json({ message: 'Registro exitoso', success: true });
    } catch (error) {
        console.error('Error al insertar datos:', error);
        res.status(500).json({ message: 'Error al insertar datos en la base de datos' });
    }
}); 

app.listen(port, '0.0.0.0', () => {
    console.log('Servidor Corriendo en el Puerto', port);
});
