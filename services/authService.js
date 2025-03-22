const bcrypt = require('bcrypt');
const crypto = require('crypto');
const pool = require('../dbs/db');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('./emailService');

// Function to register a new user
const registerUser = async (username, email, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Save user to database
        await pool.query(
            'INSERT INTO users (username, email, password, verification_token, verified) VALUES ($1, $2, $3, $4, $5)',
            [username, email, hashedPassword, verificationToken, false]
        );

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        return { message: 'User created! Please verify your email.' };
    } catch (error) {
        throw new Error('Signup failed: ' + error.message);
    }
};
const loginUser = async (email, password) => {
    try {
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userQuery.rows.length === 0) {
      return ({ message: 'Invalid email or password' });
    }

    const user = userQuery.rows[0];

    // Check if user has verified their email -- fixed bug.
    if (!user.verified) {
      return ({ message: 'Please verify your email before logging in.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return ({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return ({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Login failed'+error.message );
  }
};


module.exports = { registerUser, loginUser };
