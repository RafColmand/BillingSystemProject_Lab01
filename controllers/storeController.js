// controllers/storeController.js 
const validator = require('validator');
const sql = require('mssql');
const { poolPromise } = require('../db');

// Consultar todas las tiendas
exports.searchStore = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Tiendas');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Consultar Tiendas por ID
exports.searchStoreById = async (req, res) => {
  const id_tienda = parseInt(req.params.id, 10);

  // Validar que el ID sea válido
  if (isNaN(id_tienda)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_tienda', sql.Int, id_tienda)
      .query('SELECT * FROM Tiendas WHERE id_tienda = @id_tienda');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Tienda no encontrado' });
    }

    res.json(result.recordset[0]); // Retorna el primer resultado encontrado
  } catch (error) {
    console.error("Error al consultar tienda:", error);
    res.status(500).json({ error: error.message });
  }
};

// Crear tienda 
exports.newStore = async (req, res) => {
  const { nombre, direccion, correo, informacion_legal } = req.body;

  //Validación de correo Electrónico
  if (!validator.isEmail(correo)) {
    return res.status(400).json({ error: "correo electrónico inválido" });
  }
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('nombre', sql.NVarChar, nombre)
      .input('direccion', sql.NVarChar, direccion)
      .input('correo', sql.NVarChar, correo)
      .input('informacion_legal', sql.NVarChar, informacion_legal)
      .query('INSERT INTO Tiendas (nombre, direccion, correo, informacion_legal) VALUES (@nombre, @direccion, @correo, @informacion_legal)');
    res.status(201).json({ mensaje: 'Tienda creada exitosamente' });
  } catch (error) {
    console.error("Error al crear tienda:", error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar tienda existentes
exports.updateStore = async (req, res) => {
  const id_tienda = parseInt(req.params.id, 10);
  const { nombre, direccion, correo, informacion_legal } = req.body;

  // Validación del ID del cliente antes de actualizar
  if (isNaN(id_tienda)) {
    return res.status(400).json({ error: "ID inválido" });
  }
  // Validación de correo Electrónico
  if (correo && !validator.isEmail(correo)) {
    return res.status(400).json({ error: "correo electrónico inválido" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_tienda', sql.Int, id_tienda)
      .input('nombre', sql.NVarChar, nombre)
      .input('direccion', sql.NVarChar, direccion)
      .input('correo', sql.NVarChar, correo)
      .input('informacion_legal', sql.NVarChar, informacion_legal)
      .query(`
              UPDATE Tiendas
              SET nombre = @nombre, direccion = @direccion, correo = @correo, informacion_legal = @informacion_legal  
              WHERE id_tienda = @id_tienda
          `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Tienda no encontrada' });
    }
    res.json({ message: 'Tienda actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar Tienda 
exports.deleteStore = async (req, res) => {
  const id_tienda = parseInt(req.params.id, 10);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_tienda', sql.Int, id_tienda)
      .query('DELETE FROM Tiendas WHERE id_tienda = @id_tienda');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Tienda no encontrada' });
    }

    res.json({ message: 'Tienda eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};