const mysql = require('mysql2');


const connection = mysql.createConnection({
    host: 'localhost',      
    user: 'c2710325_killer',           
    password: 'SistemaIES6021',           
    database: 'c2710325_sistema'    
}).promise();               


module.exports = connection;