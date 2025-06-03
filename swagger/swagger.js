const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Billing System Project API',
      version: '1.0.0',
      description: 'Documentación de los Endpoints correspondientes al sistema de facturación electrónica',
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
            id: {
              type: 'integer',
              description: 'ID único del cliente (generado automáticamente)',
              readOnly: true
            },
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
            id: {
              type: 'integer',
              description: 'ID único del producto (generado automáticamente)',
              readOnly: true
            },
            nombre: { type: 'string', description: 'Nombre del producto' },
            descripcion: { type: 'string', description: 'Descripción del producto' },
            categoria: { type: 'string', description: 'Categoría del producto' },
            precio: { type: 'number', format: 'float', description: 'Precio del producto' },
            impuesto: { type: 'number', format: 'float', description: 'Impuesto del producto' },
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
        Orden: {
          type: 'object',
          required: ['id_cliente', 'estado', 'detalles'],
          properties: {
            id_orden: {
              type: 'integer',
              description: 'ID único de la orden (generado automáticamente)',
              readOnly: true
            },
            id_cliente: {
              type: 'integer',
              description: 'ID del cliente que realizó la orden'
            },
            total: {
              type: 'number',
              format: 'decimal',
              description: 'Total de la orden, calculado automáticamente, que incluye los productos, impuestos y descuentos',
              readOnly: true
            },
            estado: {
              type: 'string',
              description: 'Estado de la orden (por ejemplo, pendiente, completada, cancelada)'
            },
            detalles: {
              type: 'array',
              description: 'Lista de los productos que forman parte de la orden',
              items: {
                type: 'object',
                properties: {
                  id_producto: {
                    type: 'integer',
                    description: 'ID del producto en la orden'
                  },
                  cantidad: {
                    type: 'integer',
                    description: 'Cantidad del producto en la orden'
                  },
                  precio: {
                    type: 'number',
                    format: 'decimal',
                    description: 'Precio unitario del producto. Este valor se obtiene de la entidad Productos.',
                    readOnly: true
                  },
                  subtotal: {
                    type: 'number',
                    format: 'decimal',
                    description: 'Subtotal calculado para este producto: cantidad * precio (sin impuestos ni descuentos)',
                    readOnly: true
                  },
                  impuesto: {
                    type: 'number',
                    format: 'decimal',
                    description: 'Impuesto aplicado al producto. Este valor se obtiene de la entidad Productos.',
                    readOnly: true
                  },
                  descuento: {
                    type: 'number',
                    format: 'decimal',
                    description: 'Descuento aplicado al producto'
                  }
                }
              }
            }
          },
          example: {
            id_cliente: 1,
            estado: "pendiente",
            detalles: [
              {
                id_producto: 101,
                cantidad: 2,
                precio: 29.99,
                subtotal: 59.98,
                impuesto: 4.8,
                descuento: 0
              }
            ]
          }
        },
        Rol: {
          type: 'object',
          required: ['nombre', 'descripcion'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del rol (generado automáticamente)',
              readOnly: true
            },
            nombre: {
              type: 'string',
              description: 'Nombre del rol'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del rol y sus permisos'
            }
          },
          example: {
            nombre: "Administrador",
            descripcion: "Rol con todos los permisos de gestión del sistema"
          }
        },
        Usuario: {
          type: 'object',
          required: ['id_rol', 'nombre', 'correo', 'clave', 'estado'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario (generado automáticamente)',
              readOnly: true
            },
            id_rol: {
              type: 'integer',
              description: 'ID del rol asignado al usuario'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del usuario'
            },
            correo: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario'
            },
            clave: {
              type: 'string',
              format: 'password',
              description: 'Contraseña del usuario (almacenada de forma segura)'
            },
            estado: {
              type: 'string',
              enum: ['activo', 'inactivo'],
              description: 'Estado del usuario'
            },
            fecha_creacion: {
              type: 'string',
              format: 'date-time',
              readOnly: true,
              description: 'Fecha de creación del usuario'
            }
          },
          example: {
            id_rol: 1,
            nombre: "Isa Miranda",
            correo: "IsaMiranda@gmail.com",
            clave: "IsaMir1234*",
            estado: "activo"
          }
        },
        Tienda: {
          type: 'object',
          required: ['nombre', 'direccion', 'correo', 'informacion_legal'],
          properties: {
            id_tienda: {
              type: 'integer',
              description: 'ID único de la tienda (generado automáticamente)',
              readOnly: true
            },
            nombre: {
              type: 'string',
              description: 'Nombre de la tienda'
            },
            direccion: {
              type: 'string',
              description: 'Dirección física de la tienda'
            },
            correo: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico de contacto de la tienda'
            },
            informacion_legal: {
              type: 'string',
              description: 'Información legal relacionada con la tienda'
            }
          },
          example: {
            id_tienda: 1,
            nombre: "TodoMarket",
            direccion: "Av. Principal 58, Barquisimeto",
            correo: "todomarket@gmail.com",
            informacion_legal: "RIF: J-12345678-9"
          }
        },
        TiendaInput: {
          type: 'object',
          required: ['nombre', 'direccion', 'correo', 'informacion_legal'],
          properties: {
            nombre: {
              type: 'string',
              description: 'Nombre de la tienda'
            },
            direccion: {
              type: 'string',
              description: 'Dirección física de la tienda'
            },
            correo: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico de contacto de la tienda'
            },
            informacion_legal: {
              type: 'string',
              description: 'Información legal relacionada con la tienda'
            }
          },
          example: {
            nombre: "TodoMarket",
            direccion: "Av. Principal 58, Barquisimeto",
            correo: "todomarket@gmail.com",
            informacion_legal: "RIF: J-12345678-9"
          }
        },
        Factura: {
          type: 'object',
          required: ['id_orden', 'id_usuario', 'id_tienda', 'metodo_pago'],
          properties: {
            id_factura: {
              type: 'integer',
              description: 'ID único de la factura (generado automáticamente)',
              readOnly: true
            },
            id_orden: {
              type: 'integer',
              description: 'ID de la orden asociada a la factura'
            },
            id_cliente: {
              type: 'integer',
              description: 'ID del cliente asociado a la orden',
              readOnly: true
            },
            id_usuario: {
              type: 'integer',
              description: 'ID del usuario que creó la factura'
            },
            id_tienda: {
              type: 'integer',
              description: 'ID de la tienda donde se generó la factura'
            },
            total_bruto: {
              type: 'number',
              format: 'float',
              description: 'Total bruto calculado desde los detalles de la orden',
              readOnly: true
            },
            impuestos: {
              type: 'number',
              format: 'float',
              description: 'Total de impuestos aplicados',
              readOnly: true
            },
            descuentos: {
              type: 'number',
              format: 'float',
              description: 'Total de descuentos aplicados',
              readOnly: true
            },
            total_neto: {
              type: 'number',
              format: 'float',
              description: 'Total neto (total_bruto + impuestos - descuentos)',
              readOnly: true
            },
            estado: {
              type: 'string',
              description: 'Estado actual de la factura',
              enum: ['emitida', 'cancelada', 'pendiente']
            },
            metodo_pago: {
              type: 'string',
              description: 'Método de pago utilizado'
            },
            observaciones: {
              type: 'string',
              description: 'Observaciones adicionales de la factura',
              nullable: true
            },
            fecha_creacion: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha en que se creó la factura',
              readOnly: true
            }
          },
          example: {
            id_factura: 1,
            id_orden: 10,
            id_cliente: 5,
            id_usuario: 3,
            id_tienda: 2,
            total_bruto: 100.00,
            impuestos: 16.00,
            descuentos: 5.00,
            total_neto: 111.00,
            estado: "emitida",
            metodo_pago: "tarjeta",
            observaciones: "Sin observaciones",
            fecha_creacion: "2025-06-03T10:00:00Z"
          }
        },
        FacturaInput: {
          type: 'object',
          required: ['id_orden', 'id_usuario', 'id_tienda', 'metodo_pago'],
          properties: {
            id_orden: {
              type: 'integer',
              description: 'ID de la orden asociada a la factura'
            },
            id_usuario: {
              type: 'integer',
              description: 'ID del usuario que crea la factura'
            },
            id_tienda: {
              type: 'integer',
              description: 'ID de la tienda donde se genera la factura'
            },
            estado: {
              type: 'string',
              description: 'Estado actual de la factura',
              enum: ['emitida', 'cancelada', 'pendiente'],
              default: 'emitida'
            },
            metodo_pago: {
              type: 'string',
              description: 'Método de pago utilizado'
            },
            observaciones: {
              type: 'string',
              description: 'Observaciones adicionales',
              nullable: true
            }
          },
          example: {
            id_orden: 10,
            id_usuario: 3,
            id_tienda: 2,
            estado: "emitida",
            metodo_pago: "tarjeta",
            observaciones: "Factura sin incidencias"
          }
        },
      }
    }
  },
  apis: ['./routes/*.js'], // Ruta de los endpoints
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
