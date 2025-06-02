// index.js 
const express = require('express');
const fs = require('fs');
const productRoutes = require('./routes/productRoutes');
const clientRoutes = require('./routes/clientRoutes');
const orderRoutes = require('./routes/orderRoutes');
const emailRoutes = require('./routes/emailRoutes');
const smsRoutes = require('./routes/smsRoutes');
const roleRoutes = require('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');
const billRoutes = require('./routes/billRoutes');
const sendBillRoutes= require('./routes/sendBillRoutes')
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const app = express();
const PORT = process.env.PORT || 3000;
const { poolPromise } = require('./db');

require('dotenv').config();
// Middleware para parsear JSON en las peticiones 
app.use(express.json());

// Inicializar DB con init.sql
async function initializeDatabase() {
    try {
        const pool = await poolPromise;
        const script = fs.readFileSync('./init.sql', 'utf-8');
        await pool.request().batch(script);
        console.log('Tablas creadas/verificadas correctamente.');
    } catch (err) {
        console.error('Error al inicializar la base de datos:', err);
    }
}

initializeDatabase();

// Rutas de la API  
app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/email', emailRoutes);
app.use('/api', smsRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/sendBill', sendBillRoutes);



// Ruta de documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Inicio del servidor 
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Documentación en ${PORT}/api-docs`);
}); 