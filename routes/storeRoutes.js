// routes/storeRoutes.js 
const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');


router.get('/', storeController.searchStore);
router.get('/:id', storeController.searchStoreById);
router.post('/', storeController.newStore);
router.put('/:id', storeController.updateStore);
router.delete('/:id', storeController.deleteStore);

module.exports = router; 