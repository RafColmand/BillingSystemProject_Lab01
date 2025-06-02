const sql = require('mssql');
const { poolPromise } = require('../db');

// Crear nueva factura
exports.newFactura = async (req, res) => {
    const {
        id_orden, id_usuario, id_tienda, estado, metodo_pago, observaciones
    } = req.body;

    try {
        const pool = await poolPromise;

        // Verificar existencia del usuario
        const userResult = await pool.request()
            .input('id_usuario', sql.Int, id_usuario)
            .query('SELECT 1 FROM Usuarios WHERE id_usuario = @id_usuario');
        if (userResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar existencia de la orden
        const orderResult = await pool.request()
            .input('id_orden', sql.Int, id_orden)
            .query('SELECT 1 FROM Ordenes WHERE id_orden = @id_orden');
        if (orderResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        // Verificar existencia de la tienda
        const storeResult = await pool.request()
            .input('id_tienda', sql.Int, id_tienda)
            .query('SELECT 1 FROM Tiendas WHERE id_tienda = @id_tienda');
        if (storeResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Tienda no encontrada' });
        }

        //Calcular total_bruto desde DetalleOrden
        const result_sum = await pool.request()
            .input('id_orden', sql.Int, id_orden)
            .query(`
                SELECT 
                    ISNULL(SUM(subtotal), 0) AS total_bruto,
                    ISNULL(SUM(impuesto), 0) AS impuestos,
                    ISNULL(SUM(descuento), 0) AS descuentos
                FROM DetalleOrden
                WHERE id_orden = @id_orden
            `);

        const { total_bruto, impuestos, descuentos } = result_sum.recordset[0];

        //Calcular total_neto
        const total_neto = total_bruto + impuestos - descuentos;

        //Obtener cliente orden
        const client = await pool.request()
            .input('id_orden', sql.Int, id_orden)
            .query('Select id_cliente FROM Ordenes Where id_orden = @id_orden');
        const id_cliente = client.recordset[0]?.id_cliente

        await pool.request()
            .input('id_orden', sql.Int, id_orden)
            .input('id_cliente', sql.Int, id_cliente)
            .input('id_usuario', sql.Int, id_usuario)
            .input('id_tienda', sql.Int, id_tienda)
            .input('total_bruto', sql.Decimal(10, 2), total_bruto)
            .input('impuestos', sql.Decimal(10, 2), impuestos)
            .input('descuentos', sql.Decimal(10, 2), descuentos || 0)
            .input('total_neto', sql.Decimal(10, 2), total_neto)
            .input('estado', sql.VarChar(20), estado || 'emitida')
            .input('metodo_pago', sql.VarChar(50), metodo_pago)
            .input('observaciones', sql.NVarChar(sql.MAX), observaciones)
            .query(`
        INSERT INTO Factura (
          id_orden, id_cliente, id_usuario, id_tienda,
          total_bruto, impuestos, descuentos, total_neto,
          estado, metodo_pago, observaciones
        ) VALUES (
          @id_orden, @id_cliente, @id_usuario, @id_tienda,
          @total_bruto, @impuestos, @descuentos, @total_neto,
          @estado, @metodo_pago, @observaciones
        )
      `);

        res.status(201).json({ mensaje: 'Factura creada exitosamente' });
    } catch (error) {
        console.error("Error al crear factura:", error);
        res.status(500).json({ error: error.message });
    }
};

// Consultar todas las facturas
exports.searchFacturas = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Factura');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Consultar factura por ID
exports.searchFacturaById = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_factura', sql.Int, id)
            .query('SELECT * FROM Factura WHERE id_factura = @id_factura');

        if (result.recordset.length === 0) {
            return res.status(404).json({ mensaje: 'Factura no encontrada' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar factura
exports.updateFactura = async (req, res) => {
    const id_factura = parseInt(req.params.id, 10);
    const {
        id_orden, id_usuario, id_tienda, estado, metodo_pago, observaciones
    } = req.body;

    if (isNaN(id_factura)) return res.status(400).json({ error: 'ID inválido' });

    try {
        const pool = await poolPromise;

        // Verificar existencia del usuario
        const userResult = await pool.request()
            .input('id_usuario', sql.Int, id_usuario)
            .query('SELECT 1 FROM Usuarios WHERE id_usuario = @id_usuario');
        if (userResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar existencia de la orden
        const orderResult = await pool.request()
            .input('id_orden', sql.Int, id_orden)
            .query('SELECT 1 FROM Ordenes WHERE id_orden = @id_orden');
        if (orderResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        // Verificar existencia de la tienda
        const storeResult = await pool.request()
            .input('id_tienda', sql.Int, id_tienda)
            .query('SELECT 1 FROM Tiendas WHERE id_tienda = @id_tienda');
        if (storeResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Tienda no encontrada' });
        }

        //Calcular total_bruto desde DetalleOrden
        const result_sum = await pool.request()
            .input('id_orden', sql.Int, id_orden)
            .query(`
                SELECT 
                    ISNULL(SUM(subtotal), 0) AS total_bruto,
                    ISNULL(SUM(impuesto), 0) AS impuestos,
                    ISNULL(SUM(descuento), 0) AS descuentos
                FROM DetalleOrden
                WHERE id_orden = @id_orden
            `);

        const { total_bruto, impuestos, descuentos } = result_sum.recordset[0];

        //Calcular total_neto
        const total_neto = total_bruto + impuestos - descuentos;

        //Obtener cliente orden
        const client = await pool.request()
            .input('id_orden', sql.Int, id_orden)
            .query('Select id_cliente FROM Ordenes Where id_orden = @id_orden');
        const id_cliente = client.recordset[0]?.id_cliente

        const result = await pool.request()
            .input('id_factura', sql.Int, id_factura)
            .input('id_orden', sql.Int, id_orden)
            .input('id_cliente', sql.Int, id_cliente)
            .input('id_usuario', sql.Int, id_usuario)
            .input('id_tienda', sql.Int, id_tienda)
            .input('total_bruto', sql.Decimal(10, 2), total_bruto)
            .input('impuestos', sql.Decimal(10, 2), impuestos)
            .input('descuentos', sql.Decimal(10, 2), descuentos)
            .input('total_neto', sql.Decimal(10, 2), total_neto)
            .input('estado', sql.VarChar(20), estado)
            .input('metodo_pago', sql.VarChar(50), metodo_pago)
            .input('observaciones', sql.NVarChar(sql.MAX), observaciones)
            .query(`
        UPDATE Factura
        SET id_orden = @id_orden, id_cliente = @id_cliente,
            id_usuario = @id_usuario, id_tienda = @id_tienda,
            total_bruto = @total_bruto, impuestos = @impuestos,
            descuentos = @descuentos, total_neto = @total_neto,
            estado = @estado, metodo_pago = @metodo_pago,
            observaciones = @observaciones
        WHERE id_factura = @id_factura
      `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ mensaje: 'Factura no encontrada' });
        }

        res.json({ mensaje: 'Factura actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar factura
exports.deleteFactura = async (req, res) => {
    const id_factura = parseInt(req.params.id, 10);
    if (isNaN(id_factura)) return res.status(400).json({ error: 'ID inválido' });

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_factura', sql.Int, id_factura)
            .query('DELETE FROM Factura WHERE id_factura = @id_factura');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ mensaje: 'Factura no encontrada' });
        }

        res.json({ mensaje: 'Factura eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};