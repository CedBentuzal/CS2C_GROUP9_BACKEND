const express = require('express');
const router = express.Router();
const pool = require('../dbs/db');


router.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    try {
        const result = await pool.query('SELECT * FROM users WHERE verification_token = $1', [token]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        //user is verified.
        await pool.query('UPDATE users SET verified = TRUE, verification_token = NULL WHERE verification_token = $1', [token]);

        res.json({ message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Verification failed', error: error.message });
    }
});

module.exports = router;
