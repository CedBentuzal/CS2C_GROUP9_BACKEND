const bcrypt = require('bcrypt');
const crypto = require('crypto');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('./emailService');
const os = require('os');

// Helper function to get network IP
function getNetworkIp() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces).flat()) {
        if (iface.family === 'IPv4' && !iface.internal) {
            return iface.address;
        }
    }
    return 'localhost';
}

// Function to register a new user
const registerUser = async (username, email, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Check if email or username is already taken
        const checkuser = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (checkuser.rows.length > 0) {
            return { success: false, message: 'Email or username already taken' };
        }

        await pool.query(
            'INSERT INTO users (username, email, password, verification_token, verified) VALUES ($1, $2, $3, $4, $5)',
            [username, email, hashedPassword, verificationToken, false]
        );

        // Get network IP and port for verification link
        const networkIp = getNetworkIp();
        const port = process.env.PORT || 3000;
        
        // Send verification email with network IP and port
        await sendVerificationEmail(email, verificationToken, networkIp, port);
          
        return { success: true, message: 'User created! Please verify your email.' };
    } catch (error) {
        console.error('Registration error:', error);
        throw new Error('Error registering user: ' + error.message);
    }
};

const loginUser = async (email, password) => {
    try {
        const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
        if (userQuery.rows.length === 0) {
            return { success: false, message: 'Invalid email or password' };
        }
    
        const user = userQuery.rows[0];
    
        if (!user.verified) {
            return { success: false, message: 'Please verify your email before logging in.' };
        }
    
        const isMatch = await bcrypt.compare(password, user.password);
    
        if (!isMatch) {
            return { success: false, message: 'Invalid email or password' };
        }
    
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        return {
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Login failed: ' + error.message };
    }
};

module.exports = { registerUser, loginUser };