const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

router.get('/', billController.searchFacturas);
router.get('/:id', billController.searchFacturaById);
router.post('/', billController.newFactura);
router.put('/:id', billController.updateFactura);
router.delete('/:id', billController.deleteFactura);

module.exports = router;
