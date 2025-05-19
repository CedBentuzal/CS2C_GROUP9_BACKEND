const express = require('express');
const router = express.Router();
const authenticate = require('../middle_wear/auth');
const { 
  addProduct, 
  getProducts, 
  getProductById,
  deleteProduct,
  getLatestProducts 
} = require('../services/productService');

// ======================
// Protected Routes (Require Auth)
// ======================
router.post('/', authenticate, async (req, res) => {
  const { name, price, description, image_url, category } = req.body;

  // Input validation
  if (!name || !price || !image_url) {
    return res.status(400).json({ 
      success: false, 
      message: 'Name, price, and image URL are required' 
    });
  }

  try {
    const product = await addProduct({
      name,
      price: parseFloat(price),
      description,
      image_url,
      category: category || 'Uncategorized',
      user_id: req.user.id
    });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Product creation failed:', error);
    res.status(500).json({ 
      success: false, 
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Failed to create product'
    });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const deleted = await deleteProduct(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
    }
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error(`Delete failed for product ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ======================
// Public Routes
// ======================
router.get('/', async (req, res) => {
  try {
    // Extract query parameters
    const { 
      sort = 'newest', 
      limit = 20, 
      category,
      page = 1 
    } = req.query;

    // Validate inputs
    const validSorts = ['newest', 'price_asc', 'price_desc'];
    if (!validSorts.includes(sort)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid sort parameter. Use: ${validSorts.join(', ')}` 
      });
    }

    const products = await getProducts({ 
      sort, 
      limit: parseInt(limit),
      category,
      page: parseInt(page)
    });

    res.status(200).json({ 
      success: true,
      data: products,
      meta: {
        count: products.length,
        page: parseInt(page),
        sort
      }
    });
  } catch (error) {
    console.error('Product fetch failed:', error);
    res.status(500).json({ 
      success: false, 
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Failed to fetch products'
    });
  }
});

// New endpoint for latest products (optimized for dashboard)
router.get('/latest', async (req, res) => {
  try {
    const products = await getLatestProducts(10); // Default to 10 latest
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Latest products fetch failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch latest products' 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
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

// PUT /api/products/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, image_url, category } = req.body;
    
    await pool.query(
      `UPDATE products SET 
        name = $1, 
        price = $2, 
        description = $3, 
        image_url = $4,
        category = $5
       WHERE id = $6`,
      [name, price, description, image_url, category, id]
    );
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;