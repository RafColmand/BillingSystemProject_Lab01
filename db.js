const sql = require('mssql');

// Configuración de la conexión con la BD
const config = {
    user: 'sa',
    password: 'Memt1604*',
    server: 'localhost',
    database: 'PruebaDB',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Conexión con la BD
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Conectado a SQL Server');
        return pool;
    })
    .catch(err => console.log('Error al conectar a SQL Server:', err));

module.exports = { sql, poolPromise };