const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const pool = require('../config/db'); 
require('dotenv').config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});


const sendVerificationEmail = async (email, token) => {
    try {
        const baseUrl = process.env.BASE_URL;
        if (!baseUrl) {
            throw new Error('BASE_URL not set in .env file');}
        const verificationLink = `${baseUrl}/api/verify-email?token=${token}`;

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Verify Your Email",
            html: `<p>Click the link below to verify your email:</p>
                   <a href="${verificationLink}">Verify Email</a>`
        };

        await transporter.sendMail(mailOptions);
        console.log("Verification email sent to:", email);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send verification email.");
    }
};
const verifyEmail = async (token) => {
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE verification_token = $1',
            [token]
        );

        if (result.rows.length === 0) {
            throw new Error('Invalid or expired token');
        }

        
        await pool.query(
            'UPDATE users SET verified = TRUE, verification_token = NULL WHERE verification_token = $1',
            [token]
        );

        return { message: 'Email verified successfully! You can now log in.' };
    } catch (error) {
        throw new Error('Verification failed: ' + error.message);
    }
};


module.exports = { sendVerificationEmail, verifyEmail };
