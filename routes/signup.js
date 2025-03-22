const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const pool = require('../dbs/db'); 

const router = express.Router();

router.post('/', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        //unique verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Save user to database
        await pool.query(
            'INSERT INTO users (username, email, password, verification_token, verified) VALUES ($1, $2, $3, $4, $5)',
            [username, email, hashedPassword, verificationToken, false]
        );

        // Send verification email -- fixed
        sendVerificationEmail(email, verificationToken);

        res.status(201).json({ message: 'User created! Please verify your email.' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Signup failed', error: error.message });
    }
});

//verification email
function sendVerificationEmail(email, token) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'bentuzalcedlouise@gmail.com',
            pass: 'nfei ilav ecsn cflb'
        }
    });

    const verificationLink = `http://localhost:3000/api/verify-email?token=${token}`;

    const mailOptions = {
        from: 'bentuzalcedlouise@gmail.com',
        to: email,
        subject: 'Verify Your Email',
        html: `<p>Click the link below to verify your email:</p>
               <a href="${verificationLink}">Verify Email</a>`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending email:', err);
        } else {
            console.log('Verification email sent:', info.response);
        }
    });
}

module.exports = router;
