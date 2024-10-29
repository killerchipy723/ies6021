const mysql = require('mysql2');

// Crear la conexión a la base de datos con soporte de promesas
const connection = mysql.createConnection({
    host: 'localhost',      // Cambia esto si tu base de datos está en otro servidor
    user: 'root',           // Tu usuario de MySQL
    password: '',           // Tu contraseña de MySQL
    database: 'inst6021'    // Nombre de la base de datos
}).promise();               // Activar el modo de promesas

// Exportar la conexión
module.exports = connection;
