const express = require('express');
const router = express.Router();

const { enviarSMS } = require('../controllers/smsController');

router.post('/send-sms', enviarSMS);

module.exports = router;