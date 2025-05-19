const pool = require('../config/db');

// ======================
// Enhanced Product Service
// ======================

/**
 * Add product with category support
 * @param {Object} productData - {name, price, description, image_url, category, user_id}
 */
const addProduct = async (productData) => {
  const { name, price, description, image_url, category = 'Uncategorized', user_id } = productData;

  try {
    const { rows } = await pool.query(
      `INSERT INTO products (
        name, price, description, image_url, 
        category, user_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *`,
      [name, price, description, image_url, category, user_id]
    );
    return rows[0];
  } catch (error) {
    console.error('Product creation failed:', error);
    throw new Error('Failed to create product: ' + error.message);
  }
};

/**
 * Get products with advanced filtering
 * @param {Object} options - {sort, limit, category, page, userId}
 */
const getProducts = async (options = {}) => {
  const {
    sort = 'newest',
    limit = 20,
    category,
    page = 1,
    userId
  } = options;

  try {
    let query = 'SELECT * FROM products';
    const params = [];
    let paramCount = 1;

    // Add WHERE clauses
    const whereClauses = [];
    if (userId) {
      whereClauses.push(`user_id = $${paramCount++}`);
      params.push(userId);
    }
    if (category) {
      whereClauses.push(`category = $${paramCount++}`);
      params.push(category);
    }
    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // Add sorting
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY price DESC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY created_at DESC';
    }

    // Add pagination
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, (page - 1) * limit);

    const { rows } = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products: ' + error.message);
  }
};

/**
 * Get latest products (optimized for dashboard)
 * @param {number} limit - Max products to return
 */
const getLatestProducts = async (limit = 10) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM products 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );
    return rows;
  } catch (error) {
    console.error('Error fetching latest products:', error);
    throw new Error('Failed to fetch latest products: ' + error.message);
  }
};

/**
 * Get single product with optional ownership check
 */
const getProductById = async (id, userId = null) => {
  try {
    let query = 'SELECT * FROM products WHERE id = $1';
    const params = [id];

    if (userId) {
      query += ' AND user_id = $2';
      params.push(userId);
    }

    const { rows } = await pool.query(query, params);
    if (!rows[0]) throw new Error('Product not found');
    return rows[0];
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw new Error('Failed to fetch product: ' + error.message);
  }
};

/**
 * Delete product with ownership verification
 */
const deleteProduct = async (id, userId) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM products 
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return rowCount > 0;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw new Error('Failed to delete product: ' + error.message);
  }
};

module.exports = {
  addProduct,
  getProducts,
  getLatestProducts,
  getProductById,
  deleteProduct
};