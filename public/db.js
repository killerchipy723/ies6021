const mysql = require('mysql2');


const connection = mysql.createConnection({
   host: '200.58.106.156',      
    user: 'c2710325_killer',           
    password: 'SistemaIES6021',           
    database: 'c2710325_sistema'   
   /* host: 'localhost',      
    user: 'root',           
    password: '',           
    database: 'iesmetan' */ 
}).promise();               


module.exports = connection;