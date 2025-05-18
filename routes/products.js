const express = require('express');
const router = express.Router();
const authenticate = require('../middle_wear/auth');
const { addProduct, getProducts, getProductById } = require('../services/productService');

// Protected routes
router.post('/', authenticate, async (req, res) => {
    const { name, price, description, image_url } = req.body;

    try {
        const product = await addProduct(name, price, description, image_url, req.user.id);
        return res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/:id', authenticate);

// Public routes
router.get('/', async (req, res) => {
    try {
        const products = await getProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error(`Failed to fetch product ${req.params.id}:`, error);
        res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === 'development' 
                ? error.message 
                : 'Internal server error'
        });
    }
});

module.exports = router;