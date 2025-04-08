// index.js 
const express = require('express'); 
const productRoutes = require('./routes/productRoutes'); 
const clientRoutes = require('./routes/clientRoutes');
const orderRoutes = require('./routes/orderRoutes');
const emailRoutes = require('./routes/emailRoutes');
const smsRoutes = require('./routes/smsRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const app = express(); 
const PORT = process.env.PORT || 3000; 
const { poolPromise } = require('./db'); 

require('dotenv').config();
// Middleware para parsear JSON en las peticiones 
app.use(express.json()); 

// Rutas de la API  
app.use('/api/products', productRoutes); 
app.use('/api/clients', clientRoutes); 
app.use('/api/orders', orderRoutes); 
app.use('/api/email', emailRoutes);
app.use('/api', smsRoutes);

// Ruta de documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Inicio del servidor 
app.listen(PORT, () => { 
console.log(`Servidor corriendo en el puerto ${PORT}`); 
console.log(`Documentación en ${PORT}/api-docs`);
}); 