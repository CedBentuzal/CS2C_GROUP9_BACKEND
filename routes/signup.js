const express = require("express");
const router = express.Router();
const { registerUser } = require("../services/authService");

router.post("/", async (req, res) => {
const { username, email, password } = req.body;

try {
    const response = await registerUser(username, email, password);

    if (response.success) {
    return res.status(201).json(response);
    }
    return res.status(400).json(response);
    } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message:"Internal error" });
    }
});

module.exports = router;
