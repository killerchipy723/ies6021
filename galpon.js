const express = require('express');
const router = express.Router();
const db = require('./public/db');
const path = require('path');
const fs = require('fs');
const generarConstanciaPDFg = require('./constanciaPDFg'); // Ajusta la ruta según sea necesario


// Ruta para obtener carreras activas
router.get('/carrerag', async (req, res) => {
    const query = "SELECT idcarrera, nombre, tipo, duracion, estado FROM carrerag WHERE estado = 'Activo'";

    try {
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error('Error al obtener las carreras:', err);
        res.status(500).json({ error: 'Error al obtener las carreras' });
    }
});

// ruta para la preinscripcion


router.get('/inscripcionesg', async (req, res) => {
    if (!req.session.user || !req.session.user.dni) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const idalu = router.post('/login', async (req, res) => {
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
             FROM preinscripciong i
             JOIN alumno a ON a.idalumno = i.idalumno
             JOIN carrerag c ON c.idcarrera = i.idcarrera
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

//envio de inscripciones  

router.post('/inscripcionesg/nueva', async (req, res) => {
    const { idCarrera } = req.body;
    const idAlumno = req.session.user?.idalumno;

    if (!idAlumno || !idCarrera) {
        return res.status(400).json({ success: false, message: 'Datos incompletos' });
    }

    const fechaActual = new Date();
    fechaActual.setHours(fechaActual.getHours() - 3); // Restar 3 horas
    const fechaFormateada = fechaActual.toISOString().slice(0, 19).replace('T', ' ');

    try {
        // Consultar si ya existe una inscripción activa para el alumno
        const [existingInscription] = await db.query(
            'SELECT estado FROM preinscripciong WHERE idalumno = ? AND estado = "Activo"',
            [idAlumno]
        );

        if (existingInscription.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ya tienes una inscripción activa. No puedes inscribirte en dos carreras al mismo tiempo'
            });
        }

        // Verificar el número de inscripciones para la carrera seleccionada
        const [countResults] = await db.query(
            'SELECT COUNT(*) AS total FROM preinscripciong WHERE idcarrera = ? AND estado = "Activo"',
            [idCarrera]
        );
        const inscripcionesActivas = countResults[0]?.total || 0;

        // Definir el límite según la carrera
        const limiteInscripciones = idCarrera === 1 ? 3 : 2;

        // Validar el límite y generar advertencia si se alcanza
        let mensajeAdvertencia = null;
        if (inscripcionesActivas >= limiteInscripciones) {
            mensajeAdvertencia = 'Se alcanzó el límite de preinscripciones permitidas. Ud será inscrito como suplente.';
        }

        // Insertar la inscripción en la base de datos
        await db.query(
            'INSERT INTO preinscripciong (idalumno, idcarrera, fecha, estado) VALUES (?, ?, ?, ?)',
            [idAlumno, idCarrera, fechaFormateada, 'Activo']
        );

        // Generar el PDF y responder con el mensaje y enlace de descarga
        const [inscripciones] = await db.query(
            `SELECT i.idinscripcion, CONCAT(a.apellidos, ', ', a.nombres) AS Alumno, 
                    a.dni, c.nombre AS Carrera, 
                    DATE_FORMAT(i.fecha, '%d-%m-%Y %H:%i:%s') AS fecha
             FROM preinscripciong i
             JOIN alumno a ON a.idalumno = i.idalumno
             JOIN carrerag c ON c.idcarrera = i.idcarrera
             WHERE a.idalumno = ? AND i.estado = 'Activo'`, [idAlumno]
        );

        if (inscripciones.length > 0) {
            const inscripcion = inscripciones[0];

            const pdfDir = path.join(__dirname, 'public', 'pdfs');
            if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

            const pdfPath = path.join(pdfDir, `ConstanciaInsc-N°_${inscripcion.idinscripcion}.pdf`);

            await generarConstanciaPDFg(inscripcion.idinscripcion, inscripcion.Carrera, inscripcion.fecha, 'Activo', inscripcion.Alumno, inscripcion.dni);

            const downloadUrl = `/pdfs/ConstanciaInsc-N°${inscripcion.idinscripcion}.pdf`;
            return res.json({ 
                success: true, 
                downloadUrl, 
                message: mensajeAdvertencia || 'Inscripción realizada con éxito' 
            });
        } else {
            res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
        }
    } catch (error) {
        console.error('Error al realizar la inscripción:', error);
        res.status(500).json({ success: false, message: 'Error al realizar la inscripción' });
    }
});

//baja de inscripciones 
router.put('/inscripcionesg/bajag/:idinscripcion', async (req, res) => {
    const { idinscripcion } = req.params;

    try {
        // Actualizar el estado de la inscripción a "Baja"
        const [result] = await db.query(
            `UPDATE preinscripciong SET estado = 'Baja' WHERE idinscripcion = ?`,
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


router.get('/descargar-pdf/:idInscripcion', (req, res) => {
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



router.get('/activosg-paginadosg', async (req, res) => {
    const { pagina = 1, limite = 10 } = req.query;
    const offset = (pagina - 1) * limite;

    try {
        const query = `
            SELECT i.idinscripcion, 
                   CONCAT(a.apellidos, ', ', a.nombres) AS Alumno, 
                   a.dni, c.nombre AS Carrera, 
                   DATE_FORMAT(i.fecha, '%d-%m-%Y %H:%i:%s') AS fecha
            FROM preinscripciong i
            JOIN alumno a ON a.idalumno = i.idalumno
            JOIN carrerag c ON c.idcarrera = i.idcarrera
            WHERE i.estado = 'Activo'
            LIMIT ? OFFSET ?;
        `;
        const [result] = await db.query(query, [parseInt(limite), parseInt(offset)]);

        const [totalResult] = await db.query('SELECT COUNT(*) AS total FROM preinscripciong WHERE estado = "Activo"');
        const total = totalResult[0].total;

        res.json({ registros: result, total });
    } catch (error) {
        console.error('Error en la paginación:', error);
        res.status(500).json({ error: 'Error al obtener los datos paginados.' });
    }
});

// Ruta para obtener resumen de alumnos por carrera
router.get('/resumeng-carrerag', async (req, res) => {
    try {
        const query = `
            SELECT c.nombre AS Carrera, COUNT(*) AS Total
            FROM preinscripciong i
            JOIN carrerag c ON c.idcarrera = i.idcarrera
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

// Nueva Ruta: Filtrar preinscripciones por carrera
router.get('/activosg', async (req, res) => {
    const { idCarrera } = req.query;

    if (!idCarrera) {
        return res.status(400).json({ error: 'El ID de la carrera es requerido.' });
    }

    try {
        const query = `
            SELECT i.idinscripcion, 
                   CONCAT(a.apellidos, ', ', a.nombres) AS Alumno, 
                   a.dni, c.nombre AS Carrera, 
                   DATE_FORMAT(i.fecha, '%d-%m-%Y %H:%i:%s') AS fecha
            FROM preinscripciong i
            JOIN alumno a ON a.idalumno = i.idalumno
            JOIN carrerag c ON c.idcarrera = i.idcarrera
            WHERE  i.idcarrera = ?;
        `;
        const [result] = await db.query(query, [idCarrera]);

        res.json(result);
    } catch (error) {
        console.error('Error al filtrar preinscripciones:', error);
        res.status(500).json({ error: 'Error al filtrar las preinscripciones.' });
    }
});
 
module.exports = router; 
