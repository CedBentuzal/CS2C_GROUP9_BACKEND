const express = require('express');
const router = express.Router();
const { loginUser } = require('../services/authService');


router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await loginUser(email, password);

    if (!response.success) {
      return res.status(401).json(response);
    }
    return res.status(200).json(response);
    }catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: "Internal error" });
  
  }
});

module.exports = router;