const express = require('express');
const path = require('path');
const db = require('./public/db');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const fs = require('fs');
const pdf = require('pdfkit');
const os = require('os'); 
const generarConstanciaPDF = require('./constanciaPDF'); // Ajusta la ruta según sea necesario
const galponRouter = require('./galpon'); //
const cors = require('cors');

const galponRoutes = require('./galpon');  // Importar las rutas de galpon.js

const app = express();
const port = 1986;

// -------------- Quitar esta ruta cuando se activen las preincipciones --------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '6021.html'));
});

 
// Middleware para servir archivos estáticos y parsear JSON
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));


//cors



// Configuración de CORS
const corsOptions = {
  origin: '*', // Permitir todos los orígenes, o ajusta con el dominio que necesites
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type, Authorization',
};

app.use(cors(corsOptions));


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
            secure: false,  // Asegura que solo se usen cookies seguras en HTTPS
            httpOnly: true,
            sameSite: 'lax'
        }
    })
  ); 


  function verificarAutenticacion(req, res, next) {
    // Define rutas públicas
    const rutasPublicas = [
        '/cedes',
        '/login',
        '/registro',
        '/send-reset-email',
        '/reset-password',
        '/update-password',
        '/6021.html',
        '/6034.html',
        '/login-usuario', // Nueva ruta para procesar el formulario
        '/login_usuario.html' // Nueva ruta para servir el formulario de login de usuario
    ];

    // Permite acceso si la ruta es pública o si el usuario está autenticado
    if (rutasPublicas.includes(req.path) || req.session.user) {
        return next();
    }

    // Redirige al login si no está autenticado
    res.redirect('/login');
}




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

            const [localidadData] = await db.query(
                `SELECT c.localidad 
                 FROM alumno a 
                 JOIN cede c ON c.idcede = a.cede 
                 WHERE a.idalumno = ?`,
                [user[0].idalumno]
            );

            if (localidadData.length > 0) {
                const localidad = localidadData[0].localidad;

                // Determina la redirección basada en la localidad
                let redirectTo = '/default.html';                
                if (localidad === 'Metán') redirectTo = '/portada.html';
                if (localidad === 'El Galpón') redirectTo = '/elgalpon.html';


                return res.status(200).json({
                    success: true,
                    nombreCompleto: `${user[0].apellidos}, ${user[0].nombres}`,
                    redirectTo
                });
            } else {
                return res.status(404).json({ success: false, message: 'Localidad no encontrada.' });
            }
        } else {
            return res.status(401).json({ success: false, message: 'DNI o contraseña incorrectos.' });
        }
    } catch (error) {
        console.error('Error en la autenticación:', error);
        return res.status(500).json({ message: 'Error en el servidor.' });
    }
});

// login rectorias

app.post('/login-usuario', async (req, res) => {
    const { usuario, password } = req.body;

    try {
        const [user] = await db.query(
            'SELECT u.idusuario, c.localidad AS cede_nombre FROM usuario u JOIN cede c ON u.idcede = c.idcede WHERE u.usuario = ? AND u.clave = ?',
            [usuario, password]
        );

        if (user.length > 0) {
            const cedeNombre = user[0].cede_nombre;

            if (cedeNombre === 'Metán') {
                return res.json({
                    success: true,
                    message: 'Inicio de sesión exitoso. Redirigiendo...',
                    redirectTo: '/6021.html'
                });
            } else if (cedeNombre === 'El Galpón') {
                return res.json({
                    success: true,
                    message: 'Inicio de sesión exitoso. Redirigiendo...',
                    redirectTo: '/6034.html'
                });
            } else {
                return res.json({
                    success: false,
                    message: 'No tiene acceso autorizado a esta cede.'
                });
            }
        } else {
            return res.json({
                success: false,
                message: 'Usuario o contraseña incorrectos.'
            });
        }
    } catch (error) {
        console.error('Error al autenticar usuario:', error);
        return res.status(500).json({ success: false, message: 'Error en el servidor.' });
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
app.get('/carreras', async (req, res) => {
    const query = "SELECT idcarrera, nombre, tipo, duracion, estado FROM carreras WHERE estado = 'Activo'";

    try {
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error('Error al obtener las carreras:', err);
        res.status(500).json({ error: 'Error al obtener las carreras' });
    }
});

// ruta para obtener todas las carreras activas o inactivas

// Ruta protegida para obtener las carreras activas
app.get('/carrerast', async (req, res) => {
    const query = "SELECT idcarrera, nombre, tipo, duracion, estado FROM carreras";

    try {
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error('Error al obtener las carreras:', err);
        res.status(500).json({ error: 'Error al obtener las carreras' });
    }
});



app.use(galponRouter)


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
            text: `Aquí está el enlace para restablecer su contraseña:www.ies6021jcdavalos.online/reset-password?token=${token}`,
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
    let { dni1, cuil, apellidos, nombres, fechanac, localidad, correo, telefono, clave1, clave2, cede } = req.body;

    if (!dni1 || !correo || !cede) {
        return res.status(400).json({ message: 'DNI, correo y sede son obligatorios.' });
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
            'INSERT INTO alumno (dni, cuil, apellidos, nombres, fechanac, localidad, correo, telefono, clave, cede) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [dni1, cuil, apellidos, nombres, fechanac, localidad, correo, telefono, clave1, cede]
        );

        res.status(200).json({ message: 'Registro exitoso', success: true });
    } catch (error) {
        console.error('Error al insertar datos:', error);
        res.status(500).json({ message: 'Error al insertar datos en la base de datos.' });
    }
});

app.get('/cedes', async (req, res) => {
    try {
        const [cedes] = await db.query("SELECT idcede, nombre FROM cede where estado = 'Activo'"); // Cambia el nombre de la tabla y columna según tu base de datos
        res.status(200).json(cedes);
    } catch (error) {
        console.error('Error al obtener cedes:', error);
        res.status(500).json({ message: 'Error al obtener las cedes.' });
    }
});



// TABLA INSCRIPCIONES

app.get('/inscripciones', async (req, res) => {
    if (!req.session.user || !req.session.user.dni) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const idalu = app.post('/login', async (req, res) => {
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
            const idalu = user[0].idalumno;
            return res.status(200).json({ success: true, nombreCompleto });
        } else {
            return res.status(401).json({ success: false, message: 'DNI o contraseña incorrectos.' });
        }
    } catch (error) {
        console.error('Error en la autenticación:', error);
        return res.status(500).json({ message: 'Error en la autenticación' });
    }
}); 

    const dni = req.session.user.dni;
    console.log("DNI recibido en el backend:", dni); // Verifica el DNI

    try {
        const [inscripciones] = await db.query(
            `SELECT i.idinscripcion, CONCAT(a.apellidos, ', ', a.nombres) AS Alumno, 
                    a.dni, c.nombre AS Carrera, 
                    DATE_FORMAT(i.fecha, '%d-%m-%Y %H:%i:%s') AS fecha
             FROM preinscripcion i
             JOIN alumno a ON a.idalumno = i.idalumno
             JOIN carreras c ON c.idcarrera = i.idcarrera
             WHERE a.dni = ? AND i.estado = 'Activo'`,
            [dni]
        );

        console.log("Resultado de la consulta:", inscripciones); // Verifica el resultado de la consulta

        if (inscripciones.length > 0) {
            return res.status(200).json({ success: true, inscripciones });
        } else {
            return res.status(200).json({ success: false, message: 'No se encontraron inscripciones para este usuario.' });
        }
    } catch (error) {
        console.error('Error al obtener inscripciones:', error);
        return res.status(500).json({ message: 'Error al obtener inscripciones' });
    }
});


/// DAR BAJA A UNA INSCRIPCION DE CARRERA

app.put('/inscripciones/baja/:idinscripcion', async (req, res) => {
    const { idinscripcion } = req.params;

    try {
        // Actualizar el estado de la inscripción a "Baja"
        const [result] = await db.query(
            `UPDATE preinscripcion SET estado = 'Baja' WHERE idinscripcion = ?`,
            [idinscripcion]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'Inscripción dada de baja correctamente.' });
        } else {
            res.status(404).json({ success: false, message: 'Inscripción no encontrada.' });
        }
    } catch (error) {
        console.error('Error al dar de baja la inscripción:', error);
        res.status(500).json({ success: false, message: 'Error al dar de baja la inscripción' });
    }
});

//VERIFICAR SI EL ALUMNO ESTA INSCRIPTO CON INSCRIPCION ACTIVA

;


app.post('/inscripciones/nueva', async (req, res) => {
    const { idCarrera } = req.body;
    const idAlumno = req.session.user?.idalumno;

    if (!idAlumno || !idCarrera) {
        return res.status(400).json({ success: false, message: 'Datos incompletos' });
    }

    const fechaActual = new Date();
    fechaActual.setHours(fechaActual.getHours() - 3);
    const fechaFormateada = fechaActual.toISOString().slice(0, 19).replace('T', ' ');

    try {
        // 1️⃣ Verificar si el alumno ya tiene una inscripción activa
        const [existingInscription] = await db.query(
            'SELECT estado FROM preinscripcion WHERE idalumno = ? AND estado = "Activo"',
            [idAlumno]
        );

        if (existingInscription.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ya tienes una inscripción activa. No puedes inscribirte en dos carreras al mismo tiempo.'
            });
        }

        // 2️⃣ Obtener tipo de carrera (PROFESORADO / TECNICATURA)
        const [carreraData] = await db.query(
            'SELECT tipo FROM carreras WHERE idcarrera = ?',
            [idCarrera]
        );

        if (carreraData.length === 0) {
            return res.status(404).json({ success: false, message: 'Carrera no encontrada.' });
        }

        const tipoCarrera = carreraData[0].tipo;

        // Asignar cupos según tipo
        const cupoMaximo = tipoCarrera === "PROFESORADO" ? 80 : 100;

        // 3️⃣ Contar inscripciones activas de esa carrera
        const [countResults] = await db.query(
            'SELECT COUNT(*) AS total FROM preinscripcion WHERE idcarrera = ? AND estado = "Activo"',
            [idCarrera]
        );

        const inscripcionesActivas = countResults[0].total;

        // 4️⃣ Verificar si el cupo está lleno
        if (inscripcionesActivas >= cupoMaximo) {
            return res.status(400).json({
                success: false,
                message: `El cupo para esta carrera (${tipoCarrera}) está lleno. Cupo máximo: ${cupoMaximo} alumnos.`
            });
        }

        // 5️⃣ Insertar inscripción
        await db.query(
            'INSERT INTO preinscripcion (idalumno, idcarrera, fecha, estado) VALUES (?, ?, ?, ?)',
            [idAlumno, idCarrera, fechaFormateada, 'Activo']
        );

        // 6️⃣ Obtener datos de la inscripción para generar el PDF
        const [inscripciones] = await db.query(
            `SELECT i.idinscripcion, CONCAT(a.apellidos, ', ', a.nombres) AS Alumno, 
                    a.dni, c.nombre AS Carrera, 
                    DATE_FORMAT(i.fecha, '%d-%m-%Y %H:%i:%s') AS fecha
             FROM preinscripcion i
             JOIN alumno a ON a.idalumno = i.idalumno
             JOIN carreras c ON c.idcarrera = i.idcarrera
             WHERE a.idalumno = ? AND i.estado = 'Activo'`,
            [idAlumno]
        );

        if (inscripciones.length > 0) {
            const inscripcion = inscripciones[0];

            const pdfDir = path.join(__dirname, 'public', 'pdfs');
            if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

            const pdfPath = path.join(pdfDir, `ConstanciaInsc-N°_${inscripcion.idinscripcion}.pdf`);

            await generarConstanciaPDF(
                inscripcion.idinscripcion,
                inscripcion.Carrera,
                inscripcion.fecha,
                'Activo',
                inscripcion.Alumno,
                inscripcion.dni
            );

            const downloadUrl = `/pdfs/ConstanciaInsc-N°${inscripcion.idinscripcion}.pdf`;
            return res.json({
                success: true,
                downloadUrl,
                message: 'Inscripción realizada con éxito'
            });
        } else {
            res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
        }
    } catch (error) {
        console.error('Error al realizar la inscripción:', error);
        res.status(500).json({ success: false, message: 'Error al realizar la inscripción' });
    }
});


// RUTA PARA MOSTRAR LOS CUPOS DISPONIBLES POR CARRERA
app.get('/carreras/cupos', async (req, res) => {
    try {
        // Obtener todas las carreras activas
        const [carreras] = await db.query(
            `SELECT idcarrera, nombre, tipo 
             FROM carreras 
             WHERE estado = 'Activo'`
        );

        let dataCupos = [];

        for (let carrera of carreras) {
            const cupoMaximo = carrera.tipo === "PROFESORADO" ? 80 : 100;

            // Contar inscripciones activas por carrera
            const [result] = await db.query(
                `SELECT COUNT(*) AS total 
                 FROM preinscripcion 
                 WHERE idcarrera = ? AND estado = 'Activo'`,
                [carrera.idcarrera]
            );

            const inscriptos = result[0].total;
            const disponibles = cupoMaximo - inscriptos;

            dataCupos.push({
                idcarrera: carrera.idcarrera,
                nombre: carrera.nombre,
                tipo: carrera.tipo,
                cupoMaximo,
                inscriptos,
                disponibles
            });
        }

        res.status(200).json({ success: true, carreras: dataCupos });

    } catch (error) {
        console.error("Error al obtener cupos:", error);
        res.status(500).json({ success: false, message: "Error al obtener cupos" });
    }
});

//CUPOS DE CARRERAS

// RUTA PARA MOSTRAR EL CUPO DE UNA SOLA CARRERA (POR ID)
app.get('/carreras/cupos/:id', async (req, res) => {
    const idCarrera = req.params.id;

    try {
        // Obtener datos de la carrera
        const [datos] = await db.query(
            `SELECT idcarrera, nombre, tipo 
             FROM carreras 
             WHERE idcarrera = ? AND estado = 'Activo'`,
            [idCarrera]
        );

        if (datos.length === 0) {
            return res.json({ success: false, message: "Carrera no encontrada" });
        }

        const carrera = datos[0];
        const cupoMaximo = carrera.tipo === "PROFESORADO" ? 80 : 100;

        // Contar cuántos inscriptos activos tiene esa carrera
        const [count] = await db.query(
            `SELECT COUNT(*) AS total 
             FROM preinscripcion 
             WHERE idcarrera = ? AND estado = 'Activo'`,
            [idCarrera]
        );

        const inscriptos = count[0].total;
        const disponibles = cupoMaximo - inscriptos;

        return res.json({
            success: true,
            idcarrera: carrera.idcarrera,
            nombre: carrera.nombre,
            tipo: carrera.tipo,
            cupoMaximo,
            inscriptos,
            restantes: disponibles
        });

    } catch (error) {
        console.error("Error obteniendo cupo:", error);
        return res.json({ success: false, message: "Error al obtener cupo" });
    }
});




app.get('/descargar-pdf/:idInscripcion', (req, res) => {
    const { idInscripcion } = req.params;
    const pdfFilePath = path.join(__dirname, 'public', 'pdfs', `ConstanciaInsc-N°${idInscripcion}.pdf`);

    // Verifica si el archivo existe antes de intentar descargarlo
    if (!fs.existsSync(pdfFilePath)) {
        return res.status(404).send('Archivo no encontrado');
    }

    // Envía el archivo para descargar
    res.download(pdfFilePath, (err) => {
        if (err) {
            console.error('Error al descargar el archivo:', err);
            res.status(500).send('Error al descargar el archivo');
        } else {
            // Añadir un pequeño retraso para asegurar que la descarga se ha iniciado
            setTimeout(() => {
                // Elimina el archivo después de la descarga
                fs.unlink(pdfFilePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Error al eliminar el archivo:', unlinkErr);
                    } else {
                        console.log(`Archivo ${pdfFilePath} eliminado después de la descarga.`);
                    }
                });
            }, 10000);  // Espera 1 segundo antes de eliminar el archivo
        }
    });
});



// ruta para obtener el id del alumno

app.get('/preinscripcion', (req, res) => {
    if (req.session.user) {
        const idAlumno = req.session.user.idalumno;
        res.render('preinscripcion', { idAlumno }); // Asegúrate de que esta vista se llama 'preinscripcion'
    } else {
        res.redirect('/login'); // Redirige al login si no está autenticado
    }
});
/// TABLA DE REGISTROS

app.get('/activos', async (req, res) => {
    // Obtenemos el parámetro opcional idCarrera de la query string
    const { idCarrera } = req.query;

    // Consulta SQL base
    let query = `
        SELECT i.idinscripcion, 
               CONCAT(a.apellidos, ', ', a.nombres) AS Alumno, 
               a.dni, a.telefono,a.correo,
               c.nombre AS Carrera, 
               DATE_FORMAT(i.fecha, '%d-%m-%Y %H:%i:%s') AS fecha
        FROM preinscripcion i
        JOIN alumno a ON a.idalumno = i.idalumno
        JOIN carreras c ON c.idcarrera = i.idcarrera
        WHERE i.estado = 'Activo'
    `;

    // Si hay un idCarrera, añadimos la cláusula para filtrar
    if (idCarrera) {
        query += ` AND c.idcarrera = ?`;
    }

    try {
        // Ejecutamos la consulta con o sin parámetros
        const [result] = idCarrera 
            ? await db.query(query, [idCarrera]) 
            : await db.query(query);

        res.json(result); // Devolvemos el resultado como JSON
    } catch (error) {
        console.error('Error al obtener los registros activos:', error);
        res.status(500).json({ error: 'Error al obtener los registros activos' });
    }
});

app.get('/activos-paginados', async (req, res) => {
    const { pagina = 1, limite = 10 } = req.query;
    const offset = (pagina - 1) * limite;

    try {
        const query = `
            SELECT i.idinscripcion, 
                   CONCAT(a.apellidos, ', ', a.nombres) AS Alumno, 
                   a.dni, a.telefono,a.correo, c.nombre AS Carrera, 
                   DATE_FORMAT(i.fecha, '%d-%m-%Y %H:%i:%s') AS fecha
            FROM preinscripcion i
            JOIN alumno a ON a.idalumno = i.idalumno
            JOIN carreras c ON c.idcarrera = i.idcarrera
            WHERE i.estado = 'Activo'
            LIMIT ? OFFSET ?;
        `;
        const [result] = await db.query(query, [parseInt(limite), parseInt(offset)]);

        const [totalResult] = await db.query('SELECT COUNT(*) AS total FROM preinscripcion WHERE estado = "Activo"');
        const total = totalResult[0].total;

        res.json({ registros: result, total });
    } catch (error) {
        console.error('Error en la paginación:', error);
        res.status(500).json({ error: 'Error al obtener los datos paginados.' });
    }
});

app.get('/resumen-carreras', async (req, res) => {
    try {
        const query = `
            SELECT c.nombre AS Carrera, COUNT(*) AS Total
            FROM preinscripcion i
            JOIN carreras c ON c.idcarrera = i.idcarrera
            WHERE i.estado = 'Activo'
            GROUP BY c.idcarrera;
        `;
        const [result] = await db.query(query);
        res.json(result);
    } catch (error) {
        console.error('Error al obtener resumen por carrera:', error);
        res.status(500).json({ error: 'Error al obtener el resumen.' });
    }
});




app.listen(port, '0.0.0.0',() => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

process.on('SIGTERM', () => {
    console.log('Recibida señal de cierre, manteniendo el servidor activo.');
});
