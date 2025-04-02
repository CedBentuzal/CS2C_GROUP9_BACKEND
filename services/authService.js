const bcrypt = require('bcrypt');
const crypto = require('crypto');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('./emailService');
const { response } = require('express');

// Function to register a new user
const registerUser = async (username, email, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        /*const Emailcheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
          if (Emailcheck.rows.length > 0) {
            throw new Error ('Email is already signed up' );}
        const Usernamecheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
          if (Usernamecheck.rows.length > 0) {
            throw new Error ('Username is already taken' );}*/ //previous approach to check if email and username are unique

            // Check if email or username is already taken
        const checkuser = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
          if (checkuser.rows.length > 0) {
            return{message: 'Email or username already taken'};
          }
        await pool.query(
            'INSERT INTO users (username, email, password, verification_token, verified) VALUES ($1, $2, $3, $4, $5)',
            [username, email, hashedPassword, verificationToken, false]
        );
          // Send verification email
        await sendVerificationEmail(email, verificationToken);
          
        return {message: 'User created! Please verify your email.'};
          }catch (error) {
        throw new Error('Error registering user: ' + error.message);
    }
  };
const loginUser = async (email, password) => {
    try {
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userQuery.rows.length === 0) {
      return { message: 'Invalid email or password' };
    }

    const user = userQuery.rows[0];

    // Check if user has verified their email -- fixed bug.
    if (!user.verified) {
      return { message: 'Please verify your email before logging in.' };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return {message: 'Invalid email or password'};
    }

    jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    return {message: 'Login successful'};
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Login failed'+error.message );
  }
};

module.exports = { registerUser, loginUser };
