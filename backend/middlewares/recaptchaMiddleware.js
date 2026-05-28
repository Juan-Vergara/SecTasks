const axios = require('axios');

async function recaptchaMiddleware(req, res, next) {
  const recaptchaToken = req.body.recaptchaToken;

  if (!recaptchaToken) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, completa el reCAPTCHA.'
    });
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: {
        secret: secretKey,
        response: recaptchaToken
      }
    });

    if (response.data.success) {
      next();
    } else {
      res.status(400).json({
        success: false,
        message: 'Fallo en la validación de reCAPTCHA. Inténtalo de nuevo.'
      });
    }
  } catch (error) {
    console.error('Error verificando reCAPTCHA:', error);
    res.status(500).json({
      success: false,
      message: 'Error de servidor al validar reCAPTCHA.'
    });
  }
}

module.exports = recaptchaMiddleware;
