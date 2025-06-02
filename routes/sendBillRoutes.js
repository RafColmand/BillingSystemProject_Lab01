const express = require('express');
const router = express.Router();
const sendBillController = require('../controllers/sendBillController');

router.get('/', sendBillController.searchSendBill);
router.get('/:id', sendBillController.searchSendBillById);
router.post('/', sendBillController.newSendBill);
router.put('/:id', sendBillController.updateSendBill);
router.delete('/:id', sendBillController.deleteSendBill);

module.exports = router;