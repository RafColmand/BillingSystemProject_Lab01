//routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Endpoints para gestionar clientes
 */

/**
 * @swagger
 * /ordenes:
 *   get:
 *     summary: Obtener todas las órdenes
 *     tags: [Órdenes]
 *     responses:
 *       200:
 *         description: Lista de órdenes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Orden'
 *       500:
 *         description: Error del servidor
 */
router.get('/', orderController.searchOrders);

/**
 * @swagger
 * /ordenes/{id}:
 *   get:
 *     summary: Obtener una orden por ID
 *     tags: [Órdenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Orden encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdenConDetalles'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', orderController.searchOrderById);

/**
 * @swagger
 * /ordenes:
 *   post:
 *     summary: Crear una nueva orden
 *     tags: [Órdenes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Orden'
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *       400:
 *         description: Error en la solicitud. Posibles errores incluyen detalles faltantes o inválidos.
 *       404:
 *         description: No se encontró el cliente o un producto no existe en la base de datos.
 *       500:
 *         description: Error en el servidor al intentar procesar la orden.
 * */
router.post('/', orderController.newOrder);

/**
 * @swagger
 * /ordenes/{id}:
 *   put:
 *     summary: Actualizar una orden existente
 *     tags: [Órdenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la orden a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Orden'
 *     responses:
 *       200:
 *         description: Orden actualizada exitosamente
 *       400:
 *         description: Error en la solicitud. Posibles errores incluyen detalles faltantes o inválidos.
 *       404:
 *         description: No se encontró la orden o un producto no existe en la base de datos.
 *       500:
 *         description: Error en el servidor al intentar procesar la actualización de la orden.
 */
router.put('/:id', orderController.updateOrder);

/**
 * @swagger
 * /ordenes/{id}:
 *   delete:
 *     summary: Eliminar una orden existente
 *     tags: [Órdenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID de la orden a eliminar
 *     responses:
 *       200:
 *         description: Orden eliminada exitosamente
 *       400:
 *         description: Error en la solicitud. El ID proporcionado es inválido.
 *       404:
 *         description: No se encontró la orden con el ID proporcionado.
 *       500:
 *         description: Error en el servidor al intentar eliminar la orden.
 */
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
