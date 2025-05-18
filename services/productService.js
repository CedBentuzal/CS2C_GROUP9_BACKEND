const pool = require('../config/db');

// Add product (now assumes user_id comes from JWT)
const addProduct = async (name, price, description, image_url, user_id) => {
  try {
    const { rows } = await pool.query(
      `INSERT INTO products (name, price, description, image_url, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, price, description, image_url, user_id]
    );
    return rows[0];
  } catch (error) {
    console.error('Product creation failed:', error);
    throw new Error('Failed to create product: ' + error.message);
  }
};

// Get all products (public or filtered by user if needed)
const getProducts = async (userId = null) => {
  try {
    const query = userId 
      ? 'SELECT * FROM products WHERE user_id = $1' 
      : 'SELECT * FROM products';
    const values = userId ? [userId] : [];
    
    const { rows } = await pool.query(query, values);
    return rows;
  } catch (error) {
    throw new Error('Error fetching products: ' + error.message);
  }
};
// Get single product (with ownership check)
const getProductById = async (id, userId = null) => {
  try {
    const query = userId
      ? 'SELECT * FROM products WHERE id = $1 AND user_id = $2'
      : 'SELECT * FROM products WHERE id = $1';
    const values = userId ? [id, userId] : [id];

    const { rows } = await pool.query(query, values);
    if (!rows[0]) throw new Error('Product not found');
    return rows[0];
  } catch (error) {
    throw new Error('Error fetching product: ' + error.message);
  }
};

module.exports = { addProduct, getProducts, getProductById };