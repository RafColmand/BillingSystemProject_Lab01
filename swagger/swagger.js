const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Billing System Project API',
      version: '1.0.0',
      description: 'Documentación de los Endpoints correspondientes al sistema de facturación',
    },
    servers: [
      {
        url: 'http://localhost:3000', 
      },
    ],
    components: {
        schemas: {
          Cliente: {
            type: 'object',
            required: ['nombre', 'apellido', 'correo', 'telefono', 'direccion', 'estado'],
            properties: {
              id: { type: 'integer', description: 'ID único del cliente (generado automáticamente)', readOnly: 'true' },
              nombre: { type: 'string', description: 'Nombre del cliente' },
              apellido: { type: 'string', description: 'Apellido del cliente' },
              correo: { type: 'string', format: 'email', description: 'Correo electrónico del cliente' },
              telefono: { type: 'string', description: 'Número de teléfono' },
              direccion: { type: 'string', description: 'Dirección del cliente' },
              estado: { type: 'string', enum: ['activo', 'inactivo'], description: 'Estado del cliente' }
            },
            example: {
              nombre: "Rafael",
              apellido: "Colmenarez",
              correo: "Rafael@gmail.com",
              telefono: "0412-7192683",
              direccion: "Urbanizacion El atardecer Quibor",
              estado: "activo"
            }
          },
      
          Producto: {
            type: 'object',
            required: ['nombre', 'descripcion', 'categoria', 'precio', 'stock'],
            properties: {
              id: { type: 'integer', description: 'ID único del producto (generado automáticamente)', readOnly: 'true' },
              nombre: { type: 'string', description: 'Nombre del producto' },
              descripcion: { type: 'string', description: 'Descripción del producto' },
              categoria: { type: 'string', description: 'Categoria del producto' },
              precio: { type: 'number', format: 'float', description: 'Precio del producto' },
              impuesto : { type: 'number', format: 'float', descripcion:'Impuesto del producto'},
              stock: { type: 'integer', description: 'Cantidad en inventario' }
            },
            example: {
              nombre: "Harina",
              descripcion: "Harina precocida de maíz",
              categoria: "Alimento",
              precio: 29.99,
              stock: 50,
              impuesto: 8
            }
          },

          Orden:{
            type: 'object',
            required: ['id_cliente', 'estado', 'detalles'],
            properties:{
                id_orden: {type: 'integer', description: 'ID único de la orden (generado automáticamente)', readOnly: true},
                id_cliente: {type: 'integer', description: 'ID del cliente que realizó la orden'},
                total: {type: 'number', format: 'decimal', description: 'Total de la orden, calculado automáticamente, que incluye los productos, impuestos y descuentos', readOnly: true},
                estado: {type: 'string',  description: 'Estado de la orden (por ejemplo, pendiente, completada, cancelada)', description: 'Total de la orden, calculado automáticamente'},
                detalles: {
                    type: 'array',
                    description: 'Lista de los productos que forman parte de la orden',
                    items:{
                        type: 'object', 
                        properties:{
                            id_producto: {type: 'integer', description: 'ID del producto en la orden'},
                            cantidad: {type: 'integer', description: 'Cantidad del producto en la orden'},
                            precio: {type: 'number', format: 'decimal', description: 'Precio unitario del producto. Este valor se obtiene de la entidad Productos.', readOnly: true},
                            subtotal: {type: 'number', format: 'decimal', description: 'Subtotal calculado para este producto: cantidad * precio(sin impuestos ni descuentos)', readOnly: true},
                            impuesto: { type: 'number', format: 'decimal',  description: 'Impuesto aplicado al producto. Este valor se obtiene de la entidad Productos.', readOnly: true},
                            descuento: { type: 'number', format: 'decimal', description: 'Descuento aplicado al producto'}
                        }
                    }
                }
            }, 
            example:{

            }
            }
  
        }
      }
  },
  apis: ['./routes/*.js'], // Ruta donde están tus endpoints con comentarios Swagger
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;