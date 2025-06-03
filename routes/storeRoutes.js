const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

/**
 * @swagger
 * tags:
 *   name: Tiendas
 *   description: Endpoints para gestionar tiendas
 */

/**
 * @swagger
 * /tiendas:
 *   get:
 *     summary: Obtener todas las tiendas
 *     tags: [Tiendas]
 *     responses:
 *       200:
 *         description: Lista de tiendas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tienda'
 *       500:
 *         description: Error del servidor
 */
router.get('/', storeController.searchStore);

/**
 * @swagger
 * /tiendas/{id}:
 *   get:
 *     summary: Obtener una tienda por ID
 *     tags: [Tiendas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tienda
 *     responses:
 *       200:
 *         description: Tienda encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tienda'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Tienda no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', storeController.searchStoreById);

/**
 * @swagger
 * /tiendas:
 *   post:
 *     summary: Crear una nueva tienda
 *     tags: [Tiendas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TiendaInput'
 *     responses:
 *       201:
 *         description: Tienda creada exitosamente
 *       400:
 *         description: Error en la solicitud. Datos inválidos.
 *       500:
 *         description: Error en el servidor
 */
router.post('/', storeController.newStore);

/**
 * @swagger
 * /tiendas/{id}:
 *   put:
 *     summary: Actualizar una tienda existente
 *     tags: [Tiendas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tienda a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TiendaInput'
 *     responses:
 *       200:
 *         description: Tienda actualizada exitosamente
 *       400:
 *         description: Error en la solicitud. Datos inválidos o ID inválido.
 *       404:
 *         description: Tienda no encontrada
 *       500:
 *         description: Error en el servidor
 */
router.put('/:id', storeController.updateStore);

/**
 * @swagger
 * /tiendas/{id}:
 *   delete:
 *     summary: Eliminar una tienda existente
 *     tags: [Tiendas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tienda a eliminar
 *     responses:
 *       200:
 *         description: Tienda eliminada exitosamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Tienda no encontrada
 *       500:
 *         description: Error en el servidor
 */
router.delete('/:id', storeController.deleteStore);

module.exports = router;
