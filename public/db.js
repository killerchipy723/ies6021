const mysql = require('mysql2');

// Crear la conexión a la base de datos con soporte de promesas
const connection = mysql.createConnection({
    host: 'localhost',      // Cambia esto si tu base de datos está en otro servidor
    user: 'c2710325_killer',           // Tu usuario de MySQL
    password: 'SistemaIES6021',           // Tu contraseña de MySQL
    database: 'c2710325_sistema'    // Nombre de la base de datos
}).promise();               // Activar el modo de promesas

// Exportar la conexión
module.exports = connection;