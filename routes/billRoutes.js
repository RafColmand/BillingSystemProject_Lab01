const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

/**
 * @swagger
 * tags:
 *   name: Facturas
 *   description: Endpoints para gestionar facturas
 */

/**
 * @swagger
 * /facturas:
 *   get:
 *     summary: Obtener todas las facturas
 *     tags: [Facturas]
 *     responses:
 *       200:
 *         description: Lista de facturas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Factura'
 *       500:
 *         description: Error del servidor
 */
router.get('/', billController.searchFacturas);

/**
 * @swagger
 * /facturas/{id}:
 *   get:
 *     summary: Obtener una factura por ID
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Factura'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Factura no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', billController.searchFacturaById);

/**
 * @swagger
 * /facturas:
 *   post:
 *     summary: Crear una nueva factura
 *     tags: [Facturas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FacturaInput'
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
 *       400:
 *         description: Error en la solicitud. Datos faltantes o inválidos.
 *       404:
 *         description: Usuario, orden o tienda no encontrados
 *       500:
 *         description: Error en el servidor al crear la factura
 */
router.post('/', billController.newFactura);

/**
 * @swagger
 * /facturas/{id}:
 *   put:
 *     summary: Actualizar una factura existente
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FacturaInput'
 *     responses:
 *       200:
 *         description: Factura actualizada exitosamente
 *       400:
 *         description: Error en la solicitud. Datos faltantes o inválidos.
 *       404:
 *         description: Usuario, orden, tienda o factura no encontrados
 *       500:
 *         description: Error en el servidor al actualizar la factura
 */
router.put('/:id', billController.updateFactura);

/**
 * @swagger
 * /facturas/{id}:
 *   delete:
 *     summary: Eliminar una factura existente
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura a eliminar
 *     responses:
 *       200:
 *         description: Factura eliminada exitosamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Factura no encontrada
 *       500:
 *         description: Error en el servidor al eliminar la factura
 */
router.delete('/:id', billController.deleteFactura);

module.exports = router;
