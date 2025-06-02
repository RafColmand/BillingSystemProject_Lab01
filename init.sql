-- Inicialización de Base de Datos

-- Tabla: Clientes
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_NAME = 'Clientes')    
    BEGIN
    CREATE TABLE [dbo].[Clientes](
        [id_cliente] INT IDENTITY(1,1) NOT NULL,
        [nombre] NVARCHAR(100) NOT NULL,
        [apellido] NVARCHAR(100) NOT NULL,
        [correo] NVARCHAR(150) NOT NULL,
        [telefono] NVARCHAR(20),
        [direccion] NVARCHAR(300),
        [estado] NVARCHAR(50),
        CONSTRAINT PK_Clientes PRIMARY KEY CLUSTERED ([id_cliente] ASC),
        CONSTRAINT UQ_Clientes_Correo UNIQUE ([correo])
    )
END


-- Tabla: Productos
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_NAME = 'Productos')    
    BEGIN
    CREATE TABLE [dbo].[Productos](
        [id_producto] INT IDENTITY(1,1) NOT NULL,
        [nombre] NVARCHAR(100) NOT NULL,
        [descripcion] NVARCHAR(300),
        [categoria] NVARCHAR(100),
        [precio] DECIMAL(10,2) NOT NULL,
        [impuesto] DECIMAL(5,2),
        [stock] INT NOT NULL,
        CONSTRAINT PK_Productos PRIMARY KEY CLUSTERED ([id_producto] ASC)
    )
END


-- Tabla: Ordenes
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_NAME = 'Ordenes')    
    BEGIN
    CREATE TABLE [dbo].[Ordenes](
        [id_orden] INT IDENTITY(1,1) NOT NULL,
        [id_cliente] INT NOT NULL,
        [fecha_creacion] DATETIME DEFAULT GETDATE(),
        [total] DECIMAL(12,2),
        [estado] NVARCHAR(50),
        CONSTRAINT PK_Ordenes PRIMARY KEY CLUSTERED ([id_orden] ASC),
        CONSTRAINT FK_Ordenes_Clientes FOREIGN KEY ([id_cliente]) REFERENCES [dbo].[Clientes]([id_cliente])
    )
END


-- Tabla: DetalleOrden
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_NAME = 'DetalleOrden')    
    BEGIN
    CREATE TABLE [dbo].[DetalleOrden](
        [id_detalleOrden] INT IDENTITY(1,1) NOT NULL,
        [id_orden] INT NOT NULL,
        [id_producto] INT NOT NULL,
        [cantidad] INT NOT NULL,
        [precio] DECIMAL(10,2) NOT NULL,
        [subtotal] DECIMAL(12,2) NOT NULL,
        [impuesto] DECIMAL(5,2),
        [descuento] DECIMAL(5,2),
        CONSTRAINT PK_DetalleOrden PRIMARY KEY CLUSTERED ([id_detalleOrden] ASC),
        CONSTRAINT FK_DetalleOrden_Ordenes FOREIGN KEY ([id_orden]) REFERENCES [dbo].[Ordenes]([id_orden]),
        CONSTRAINT FK_DetalleOrden_Productos FOREIGN KEY ([id_producto]) REFERENCES [dbo].[Productos]([id_producto])
    )
END

-- Tabla: Rol
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_NAME = 'Rol')    
    BEGIN
    CREATE TABLE [dbo].[Rol](
        [id_rol] INT IDENTITY(1,1) NOT NULL,
        [tipo] VARCHAR(50) NOT NULL,
        [descripcion] NVARCHAR(300),
        CONSTRAINT PK_Rol PRIMARY KEY CLUSTERED ([id_rol] ASC),
        CONSTRAINT UQ_Rol_tipo UNIQUE NONCLUSTERED ([tipo] ASC)
    );
END;

-- Tabla: Usuarios
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_NAME = 'Usuarios') 
BEGIN
    CREATE TABLE [dbo].[Usuarios] (
        [id_usuario] INT IDENTITY(1,1) NOT NULL,
        [id_rol] INT NOT NULL,
        [nombre] NVARCHAR(100) NOT NULL,
        [correo] NVARCHAR(150) NOT NULL,
        [clave] NVARCHAR(255) NOT NULL,
        [fecha_creacion] DATETIME DEFAULT GETDATE(),
        [estado] NVARCHAR(50) DEFAULT 'activo',

        CONSTRAINT [PK_Usuario] PRIMARY KEY CLUSTERED ([id_usuario] ASC),
        CONSTRAINT [UQ_Usuario_Correo] UNIQUE ([correo]),
        CONSTRAINT [FK_Usuario_Rol] FOREIGN KEY ([id_rol]) REFERENCES [dbo].[Rol]([id_rol])
    );
END

-- Tabla: Tiendas:
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_NAME = 'Tiendas') 
    BEGIN
    CREATE TABLE [dbo].[Tiendas] (
        [id_tienda] INT IDENTITY(1,1) PRIMARY KEY,
        [nombre] NVARCHAR(100) NOT NULL,
        [direccion] NVARCHAR(255),
        [correo] NVARCHAR(100) NOT NULL,
        [informacion_legal] NVARCHAR(MAX)
    );
END

-- Tabla: Facturas:
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_NAME = 'Factura'
)
BEGIN
    CREATE TABLE [dbo].[Factura] (
        [id_factura] INT IDENTITY(1,1) PRIMARY KEY,
        [id_orden] INT NOT NULL,
        [id_cliente] INT NOT NULL,
        [id_usuario] INT NOT NULL,
        [id_tienda] INT NOT NULL,
        [fecha_emision] DATETIME NOT NULL DEFAULT GETDATE(),
        [total_bruto] DECIMAL(10,2) NOT NULL,
        [impuestos] DECIMAL(10,2) NOT NULL,
        [descuentos] DECIMAL(10,2) DEFAULT 0,
        [total_neto] DECIMAL(10,2) NOT NULL,
        [estado] VARCHAR(20) DEFAULT 'emitida',
        [metodo_pago] VARCHAR(50),
        [observaciones] NVARCHAR(MAX),

        CONSTRAINT FK_Factura_Ordenes FOREIGN KEY ([id_orden]) REFERENCES [dbo].[Ordenes]([id_orden]),
        CONSTRAINT FK_Factura_Clientes FOREIGN KEY ([id_cliente]) REFERENCES [dbo].[Clientes]([id_cliente]),
        CONSTRAINT FK_Factura_Usuarios FOREIGN KEY ([id_usuario]) REFERENCES [dbo].[Usuarios]([id_usuario]),
        CONSTRAINT FK_Factura_Tiendas FOREIGN KEY ([id_tienda]) REFERENCES [dbo].[Tiendas]([id_tienda])
    );
END

-- Tabla: Envio_Factura
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_NAME = 'Envio_Factura'
)
BEGIN
    CREATE TABLE [dbo].[Envio_Factura] (
        [id_envioFactura] INT IDENTITY(1,1) PRIMARY KEY,
        [id_factura] INT NOT NULL,
        [fecha_envio] DATETIME DEFAULT GETDATE(),
        [estado] NVARCHAR(50) NOT NULL,

        -- Relaciones (opcional)
        CONSTRAINT FK_EnvioFactura_Factura FOREIGN KEY (id_factura) 
            REFERENCES Factura(id_factura)
    );
END
