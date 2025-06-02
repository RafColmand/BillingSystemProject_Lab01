// controllers/userController.js 
const validator = require('validator');
const sql = require('mssql');
const { poolPromise } = require('../db');

// Consultar todos los usuarios
exports.searchUsers = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Usuarios');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Consultar usuario por ID
exports.searchUserById = async (req, res) => {
    const id_usuario = parseInt(req.params.id, 10);

    // Validar que el ID sea válido
    if (isNaN(id_usuario)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_usuario', sql.Int, id_usuario)
            .query('SELECT * FROM Usuarios WHERE id_usuario = @id_usuario');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(result.recordset[0]); // Retorna el primer resultado encontrado
    } catch (error) {
        console.error("Error al consultar usuario:", error);
        res.status(500).json({ error: error.message });
    }
};

// Crear usuarios 
exports.newUser = async (req, res) => {
    const { id_rol, nombre, correo, clave, estado } = req.body;

    // Validación de campos requeridos
    if (!id_rol || !nombre || !correo || !clave) {
        return res.status(400).json({ error: "Faltan campos obligatorios para la creación de usuario." });
    }

    // Validación de correo electrónico
    if (!validator.isEmail(correo)) {
        return res.status(400).json({ error: "Correo electrónico inválido" });
    }

    // Validación de contraseña fuerte
    if (!validator.isStrongPassword(clave, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
        return res.status(400).json({
            error: "La contraseña no es suficientemente segura. Debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos."
        });
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id_rol', sql.Int, id_rol)
            .input('nombre', sql.NVarChar, nombre)
            .input('correo', sql.NVarChar, correo)
            .input('clave', sql.NVarChar, clave)
            .input('estado', sql.NVarChar, estado || 'Activo')
            .query(`
                INSERT INTO Usuarios (id_rol, nombre, correo, clave, fecha_creacion, estado)
                VALUES (@id_rol, @nombre, @correo, @clave, GETDATE(), @estado)
            `);
        res.status(201).json({ mensaje: 'Usuario creado exitosamente' });
    } catch (error) {
        console.error("Error al crear usuario:", error);
        res.status(500).json({ error: error.message });
    }
};

// Actualizar usuarios existentes
exports.updateUser = async (req, res) => {
    const id_usuario = parseInt(req.params.id, 10);
    const { id_rol, nombre, correo, clave, estado } = req.body;

    // Validación del ID del usuario
    if (isNaN(id_usuario)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    // Validación de correo electrónico
    if (correo && !validator.isEmail(correo)) {
        return res.status(400).json({ error: "Correo electrónico inválido" });
    }

    // Validación de contraseña
    if (clave && !validator.isStrongPassword(clave, {
        minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
    })) {
        return res.status(400).json({
            error: "La clave debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos."
        });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_usuario', sql.Int, id_usuario)
            .input('id_rol', sql.Int, id_rol)
            .input('nombre', sql.NVarChar, nombre)
            .input('correo', sql.NVarChar, correo)
            .input('clave', sql.NVarChar, clave)
            .input('estado', sql.NVarChar, estado || 'Activo')
            .query(`
                UPDATE Usuarios
                SET id_rol = @id_rol, nombre = @nombre, correo = @correo, clave = @clave, estado = @estado
                WHERE id_usuario = @id_usuario
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: error.message });
    }
};

// Eliminar usuarios 
exports.deleteUser = async (req, res) => {
    const id_usuario = parseInt(req.params.id, 10);

    // Validación del ID
    if (isNaN(id_usuario)) {
        return res.status(400).json({ error: "ID inválido" });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_usuario', sql.Int, id_usuario)
            .query('DELETE FROM Usuarios WHERE id_usuario = @id_usuario');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: error.message });
    }
};