const mysql = require('mysql2');

// Crear la conexión a la base de datos con soporte de promesas
const connection = mysql.createConnection({
    host: 'sql10.freesqldatabase.com',      // Cambia esto si tu base de datos está en otro servidor
    user: 'sql10742951',           // Tu usuario de MySQL
    password: 'xL382AvCjK',           // Tu contraseña de MySQL
    database: 'sql10742951'    // Nombre de la base de datos
}).promise();               // Activar el modo de promesas

// Exportar la conexión
module.exports = connection;