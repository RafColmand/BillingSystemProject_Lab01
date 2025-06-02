// controllers/clientController.js 
const validator = require('validator');
const sql = require('mssql');
const { poolPromise } = require('../db');

// Consultar todos los clientes
exports.searchClient = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Clientes');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Consultar clientes por ID
exports.searchClientById = async (req, res) => {
  const id_cliente = parseInt(req.params.id, 10);

  // Validar que el ID sea válido
  if (isNaN(id_cliente)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_cliente', sql.Int, id_cliente)
      .query('SELECT * FROM Clientes WHERE id_cliente = @id_cliente');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json(result.recordset[0]); // Retorna el primer resultado encontrado
  } catch (error) {
    console.error("Error al consultar cliente:", error);
    res.status(500).json({ error: error.message });
  }
};

// Crear clientes 
exports.newClient = async (req, res) => {
  const { nombre, apellido, correo, telefono, direccion, estado } = req.body;

  //Validación de correo Electrónico
  if (!validator.isEmail(correo)) {
    return res.status(400).json({ error: "correo electrónico inválido" });
  }
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('nombre', sql.NVarChar, nombre)
      .input('apellido', sql.NVarChar, apellido)
      .input('correo', sql.NVarChar, correo)
      .input('telefono', sql.NVarChar, telefono)
      .input('direccion', sql.NVarChar, direccion)
      .input('estado', sql.NVarChar, estado || 'activo')
      .query('INSERT INTO Clientes (nombre, apellido, correo, telefono, direccion, estado) VALUES (@nombre, @apellido, @correo, @telefono, @direccion, @estado )');
    res.status(201).json({ mensaje: 'Cliente creado exitosamente' });
  } catch (error) {
    console.error("Error al crear cliente:", error); // Log del error al crear el cliente
    res.status(500).json({ error: error.message }); // Detalles del error
  }
};

// Actualizar clientes existentes
exports.updateClient = async (req, res) => {
  const id_cliente = parseInt(req.params.id, 10);
  const { nombre, apellido, correo, telefono, direccion, estado } = req.body;

  // Validación del ID del cliente antes de actualizar
  if (isNaN(id_cliente)) {
    return res.status(400).json({ error: "ID inválido" });
  }
  // Validación de correo Electrónico
  if (correo && !validator.isEmail(correo)) {
    return res.status(400).json({ error: "correo electrónico inválido" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_cliente', sql.Int, id_cliente)
      .input('nombre', sql.NVarChar, nombre)
      .input('apellido', sql.NVarChar, apellido)
      .input('correo', sql.NVarChar, correo)
      .input('telefono', sql.NVarChar, telefono)
      .input('direccion', sql.NVarChar, direccion)
      .input('estado', sql.NVarChar, estado)
      .query(`
              UPDATE Clientes
              SET nombre = @nombre, apellido = @apellido, correo = @correo, telefono = @telefono, direccion= @direccion, estado= @estado  
              WHERE id_cliente = @id_cliente
          `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar clientes 
exports.deleteClient = async (req, res) => {
  const id_cliente = parseInt(req.params.id, 10);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_cliente', sql.Int, id_cliente)
      .query('DELETE FROM Clientes WHERE id_cliente = @id_cliente');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

