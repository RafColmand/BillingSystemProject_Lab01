//controllers/orderController.js
const sql = require('mssql');
const { poolPromise } = require('../db');

// Obtener todas las órdenes
exports.searchOrders = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Ordenes');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener orden por ID (con sus detalles)
exports.searchOrderById = async (req, res) => {
  const id_orden = parseInt(req.params.id, 10);

  if (isNaN(id_orden)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const pool = await poolPromise;

    const ordenResult = await pool.request()
      .input('id_orden', sql.Int, id_orden)
      .query('SELECT * FROM Ordenes WHERE id_orden = @id_orden');

    if (ordenResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    const detallesResult = await pool.request()
      .input('id_orden', sql.Int, id_orden)
      .query('SELECT * FROM DetalleOrden WHERE id_orden = @id_orden');

    const orden = ordenResult.recordset[0];
    orden.detalles = detallesResult.recordset;

    res.json(orden);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear nueva orden
exports.newOrder = async (req, res) => {
  const { id_cliente, estado, detalles } = req.body;

  if (!Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ error: 'Debe incluir al menos un producto' });
  }

  let transaction;

  try {
    const pool = await poolPromise;
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Validar si el cliente existe
    const checkClienteRequest = new sql.Request(transaction);
    const clienteResult = await checkClienteRequest
      .input('id_cliente', sql.Int, id_cliente)
      .query('SELECT 1 FROM Clientes WHERE id_cliente = @id_cliente');

    if (clienteResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ error: `El cliente con la ID ${id_cliente} no existe` });
    }
    
    const request = new sql.Request(transaction);
    // Insertar orden con total temporal
    const ordenResult = await request
      .input('id_cliente', sql.Int, id_cliente)
      .input('total', sql.Decimal(10, 2), 0)
      .input('estado', sql.NVarChar, estado || 'pendiente')
      .query('INSERT INTO Ordenes (id_cliente, total, estado) OUTPUT INSERTED.id_orden VALUES (@id_cliente, @total, @estado)');

    const id_orden = ordenResult.recordset[0].id_orden;
    let totalOrden = 0;

    // Insertar detalles y calcular total
    for (const detalle of detalles) {
      const { id_producto, cantidad, descuento} = detalle;

      // NUEVO REQUEST para esta iteración
      const detalleRequest = new sql.Request(transaction);

      // Obtener datos del producto desde la BD
      const productoResult = await detalleRequest
        .input('id_producto', sql.Int, id_producto)
        .query('SELECT precio, impuesto, stock FROM Productos WHERE id_producto = @id_producto');

      if (productoResult.recordset.length === 0) {
        return res.status(404).json({ error: `Producto con ID ${id_producto} no encontrado` });
      }

      const { precio, impuesto, stock } = productoResult.recordset[0];

      // Validar stock
      if (cantidad > stock) {
        return res.status(400).json({ error: `La cantidad ingresada para el producto con ID ${id_producto} supera el stock disponible` });
      }

      if (descuento > 100){
        return res.status(400).json({error: "Porcentaje ingresado no valido"})
      }

      const subtotal = cantidad * precio;
      const totalDescuento = subtotal * (descuento / 100);
      const totalImpuesto = subtotal * (impuesto / 100);
      const totalDetalle = subtotal + totalImpuesto - totalDescuento;
      totalOrden += totalDetalle;

      const insertDetalleRequest = new sql.Request(transaction);
      await insertDetalleRequest
        .input('id_orden', sql.Int, id_orden)
        .input('id_producto', sql.Int, id_producto)
        .input('cantidad', sql.Int, cantidad)
        .input('precio', sql.Decimal(10, 2), precio)
        .input('subtotal', sql.Decimal(10, 2), subtotal)
        .input('impuesto', sql.Decimal(10, 2), impuesto)
        .input('descuento', sql.Decimal(10, 2), descuento)
        .query(`
          INSERT INTO DetalleOrden (id_orden, id_producto, cantidad, precio, subtotal, impuesto, descuento)
          VALUES (@id_orden, @id_producto, @cantidad, @precio, @subtotal, @impuesto, @descuento)
        `);
    }

    // Actualizar total de la orden
    const updateRequest = new sql.Request(transaction);
    await updateRequest
      .input('id_orden', sql.Int, id_orden)
      .input('total', sql.Decimal(10, 2), totalOrden)
      .query('UPDATE Ordenes SET total = @total WHERE id_orden = @id_orden');

    await transaction.commit();
    res.status(201).json({ mensaje: 'Orden creada exitosamente', id_orden });

  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    res.status(500).json({ error: error.message });
  }
};

// Actualizar orden existente
exports.updateOrder = async (req, res) => {
  const id_orden = parseInt(req.params.id, 10);
  const { id_cliente, estado, detalles } = req.body;

  if (isNaN(id_orden) || !Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ error: 'Debe proporcionar el ID de la orden y al menos un detalle de producto' });
  }

  let transaction;

  try {
    const pool = await poolPromise;
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    //Verificar si orden existe
    const request = new sql.Request(transaction);
    const ordenExistente = await request
      .input('id_orden', sql.Int, id_orden)
      .query('SELECT * FROM Ordenes WHERE id_orden = @id_orden');

    if (ordenExistente.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Actualizar cliente
    const checkOrderRequest = new sql.Request(transaction);
    await checkOrderRequest
    .input('id_orden', sql.Int, id_orden)
    .input('id_cliente', sql.Int, id_cliente)
    .query('UPDATE Ordenes SET id_cliente = @id_cliente WHERE id_orden = @id_orden');

    // Eliminar detalles anteriores
    const deleteDetailsRequest = new sql.Request(transaction);
    await deleteDetailsRequest
      .input('id_orden', sql.Int, id_orden)
      .query('DELETE FROM DetalleOrden WHERE id_orden = @id_orden');

    // Insertar nuevos detalles
    let totalOrden = 0;

    for (const detalle of detalles) {
      const { id_producto, cantidad,  descuento } = detalle;

      const productoRequest = new sql.Request(transaction);
      const productoResult = await productoRequest
        .input('id_producto', sql.Int, id_producto)
        .query('SELECT precio, impuesto, stock FROM Productos WHERE id_producto = @id_producto');

      if (productoResult.recordset.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ error: `Producto con ID ${id_producto} no encontrado` });
      }

      const { precio, impuesto, stock } = productoResult.recordset[0];

      if (cantidad > stock) {
        await transaction.rollback();
        return res.status(400).json({ error: `La cantidad ingresada para el producto con ID ${id_producto} supera el stock disponible` });
      }

      if (descuento > 100) {
        await transaction.rollback();
        return res.status(400).json({ error: "Porcentaje ingresado no válido" });
      }

      const subtotal = cantidad * precio;
      const totalDescuento = subtotal * (descuento / 100);
      const totalImpuesto = subtotal * (impuesto / 100);
      const totalDetalle = subtotal + totalImpuesto - totalDescuento;
      totalOrden += totalDetalle;

      const insertDetalleRequest = new sql.Request(transaction);
      await insertDetalleRequest
        .input('id_orden', sql.Int, id_orden)
        .input('id_producto', sql.Int, id_producto)
        .input('cantidad', sql.Int, cantidad)
        .input('precio', sql.Decimal(10, 2), precio)
        .input('subtotal', sql.Decimal(10, 2), subtotal)
        .input('impuesto', sql.Decimal(10, 2), impuesto)
        .input('descuento', sql.Decimal(10, 2), descuento)
        .query(`
          INSERT INTO DetalleOrden (id_orden, id_producto, cantidad, precio, subtotal, impuesto, descuento)
          VALUES (@id_orden, @id_producto, @cantidad, @precio, @subtotal, @impuesto, @descuento)
        `);
    }

    // Actualizar total de la orden
    const updateOrderRequest = new sql.Request(transaction);
    await updateOrderRequest
      .input('id_orden', sql.Int, id_orden)
      .input('total', sql.Decimal(10, 2), totalOrden)
      .input('estado', sql.NVarChar, estado || 'procesando')
      .query('UPDATE Ordenes SET total = @total, estado = @estado WHERE id_orden = @id_orden');

    await transaction.commit();
    res.json({ mensaje: 'Orden actualizada exitosamente' });

  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    res.status(500).json({ error: error.message });
  }
};

// Eliminar orden
exports.deleteOrder = async (req, res) => {
  const id_orden = parseInt(req.params.id, 10);

  if (isNaN(id_orden)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  let transaction;

  try {
    const pool = await poolPromise;
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Eliminar detalles primero
    const deleteDetallesRequest = new sql.Request(transaction);
    await deleteDetallesRequest
      .input('id_orden', sql.Int, id_orden)
      .query('DELETE FROM DetalleOrden WHERE id_orden = @id_orden');

    // Eliminar orden
    const deleteOrder = new sql.Request(transaction);
    const result = await deleteOrder
      .input('id_orden', sql.Int, id_orden)
      .query('DELETE FROM Ordenes WHERE id_orden = @id_orden');

    if (result.rowsAffected[0] === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    await transaction.commit();
    res.json({ mensaje: 'Orden eliminada exitosamente' });

  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    res.status(500).json({ error: error.message });
  }
};
