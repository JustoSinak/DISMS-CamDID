const { sendContactEmail } = require('../services/emailService');

const handleContactSubmission = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Send email
    await sendContactEmail({ name, email, subject, message });

    res.status(200).json({ 
      success: true, 
      message: 'Your message has been sent successfully' 
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again later.' 
    });
  }
};

module.exports = {
  handleContactSubmission
}; 