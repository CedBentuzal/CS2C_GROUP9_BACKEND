const express = require("express");
const router = express.Router();
const { registerUser } = require("../services/authService");

router.post("/", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const response = await registerUser(username, email, password);
        res.status(201).json(response);
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
