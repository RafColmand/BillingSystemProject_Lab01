// controllers/productController.js 

const sql = require('mssql');
const { poolPromise } = require('../db');


// Consultar todos los productos
exports.searchProducts = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Productos');

    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: error.message });
  }
};

// Consultar un producto por su ID
exports.searchProductById = async (req, res) => {
  const id_producto = parseInt(req.params.id, 10);

  if (isNaN(id_producto)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_producto', sql.Int, id_producto)
      .query('SELECT * FROM Productos WHERE id_producto = @id_producto');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo producto
exports.newProduct = async (req, res) => {
  const { nombre, descripcion, categoria, precio, impuesto, stock } = req.body;

  if (!nombre || !descripcion || !categoria || precio == null || impuesto == null || stock == null) {
    return res.status(400).json({ message: 'Todos los datos son requeridos' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('nombre', sql.NVarChar, nombre)
      .input('descripcion', sql.NVarChar, descripcion)
      .input('categoria', sql.NVarChar, categoria)
      .input('precio', sql.Decimal, precio)
      .input('impuesto', sql.Decimal, impuesto)
      .input('stock', sql.Int, stock)
      .query('INSERT INTO Productos (nombre, descripcion, categoria, precio, impuesto, stock) OUTPUT INSERTED.* VALUES (@nombre, @descripcion, @categoria, @precio, @impuesto, @stock)');

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar producto existente
exports.updateProduct = async (req, res) => {
  const id_producto = parseInt(req.params.id, 10);
  const { nombre, descripcion, categoria, precio, impuesto, stock } = req.body;

  if (isNaN(id_producto)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_producto', sql.Int, id_producto)
      .input('nombre', sql.NVarChar, nombre)
      .input('descripcion', sql.NVarChar, descripcion)
      .input('categoria', sql.NVarChar, categoria)
      .input('precio', sql.Decimal, precio)
      .input('impuesto', sql.Decimal, impuesto)
      .input('stock', sql.Int, stock)
      .query(`
        UPDATE Productos
        SET nombre = COALESCE(@nombre, nombre),
            descripcion = COALESCE(@descripcion, descripcion),
            categoria = COALESCE(@categoria, categoria),
            precio = COALESCE(@precio, precio),
            impuesto = COALESCE(@impuesto, impuesto),
            stock = COALESCE(@stock, stock)
        WHERE id_producto = @id_producto
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
  const id_producto = parseInt(req.params.id, 10);

  if (isNaN(id_producto)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_producto', sql.Int, id_producto)
      .query('DELETE FROM Productos WHERE id_producto = @id_producto');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: error.message });
  }
};
