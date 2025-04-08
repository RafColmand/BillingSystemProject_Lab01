const axios = require('axios');

exports.sendEmail = async (req, res) => {
  const { to, subject, message } = req.body;

  const data = {
    personalizations: [{
      to: [{ email: to }],
      subject: subject
    }],
    from: { email: process.env.EMAIL_FROM },
    content: [{
      type: 'text/plain',
      value: message
    }]
  };

  try {
    await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      data,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.status(200).json({ message: 'Correo enviado correctamente ✅' });
  } catch (error) {
    console.error('Error al enviar correo:', error.response?.data || error.message);
    res.status(500).json({ error: 'No se pudo enviar el correo ❌' });
  }
};
