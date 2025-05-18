const express = require('express');
const router = express.Router();
const { loginUser } = require('../services/authService');


router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { success, token, user, message } = await loginUser(email, password);

    if (!success) {
      return res.status(401).json({ 
        success: false,
        message: message || 'Authentication failed'
      });
    }

    // Ensure user object is properly structured
    return res.status(200).json({
      success: true,
      token: token,
      user: {  // Must include all required fields
        id: user.id,
        username: user.username,
        email: user.email
        // Add other fields your User model expects
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
});

module.exports = router;