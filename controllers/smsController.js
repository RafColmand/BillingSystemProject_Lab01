const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER; // el número verificado en Twilio

const client = twilio(accountSid, authToken);

exports.enviarSMS = async (req, res) => {
  const { to, message } = req.body;

  try {
    const response = await client.messages.create({
      body: message,
      from: fromPhone,
      to: to
    });

    res.status(200).json({
      success: true,
      message: 'SMS enviado correctamente.',
      sid: response.sid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al enviar SMS.',
      error: error.message
    });
  }
};