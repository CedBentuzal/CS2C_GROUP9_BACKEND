const express = require('express');
const router = express.Router();
const { verifyEmail } = require('../services/emailService'); // Import email service

// Route to verify email
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    try {
        const response = await verifyEmail(token);
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;

