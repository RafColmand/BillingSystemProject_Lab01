// controllers/roleController.js 

const sql = require('mssql');
const { poolPromise } = require('../db');

// Crear un nuevo rol
exports.newRole = async (req, res) => {
    const { tipo, descripcion } = req.body;

    if (!tipo || !descripcion) {
        return res.status(400).json({ message: 'Todos los datos son requeridos' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('tipo', sql.NVarChar, tipo)
            .input('descripcion', sql.NVarChar, descripcion)
            .query('INSERT INTO Rol (tipo, descripcion) OUTPUT INSERTED.* VALUES (@tipo, @descripcion)');

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error("Error al crear rol:", error);
        res.status(500).json({ error: error.message });
    }
};

// Consultar todos los roles
exports.searchRoles = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Rol');

        res.json(result.recordset);
    } catch (error) {
        console.error("Error al obtener roles:", error);
        res.status(500).json({ error: error.message });
    }
};

// Consultar un rol por su ID
exports.searchRoleById = async (req, res) => {
    const id_rol = parseInt(req.params.id, 10);

    if (isNaN(id_rol)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_rol', sql.Int, id_rol)
            .query('SELECT * FROM Rol WHERE id_rol = @id_rol');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Error al obtener rol:", error);
        res.status(500).json({ error: error.message });
    }
};

// Actualizar rol existente
exports.updateRole = async (req, res) => {
    const id_rol = parseInt(req.params.id, 10);
    const { tipo, descripcion } = req.body;

    if (isNaN(id_rol)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_rol', sql.Int, id_rol)
            .input('tipo', sql.NVarChar, tipo)
            .input('descripcion', sql.NVarChar, descripcion)
            .query(`
        UPDATE Rol
        SET tipo = COALESCE(@tipo, tipo), descripcion = COALESCE(@descripcion, descripcion)
        WHERE id_rol = @id_rol`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        res.json({ message: 'Rol actualizado exitosamente' });
    } catch (error) {
        console.error("Error al actualizar rol:", error);
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un rol
exports.deleteRole = async (req, res) => {
    const id_rol = parseInt(req.params.id, 10);

    if (isNaN(id_rol)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_rol', sql.Int, id_rol)
            .query('DELETE FROM Rol WHERE id_rol = @id_rol');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        res.json({ message: 'Rol eliminado exitosamente' });
    } catch (error) {
        console.error("Error al eliminar rol:", error);
        res.status(500).json({ error: error.message });
    }
};