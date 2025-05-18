const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {rejectUnauthorized: false},
});

pool.query('SELECT NOW()')
  .then((res) => {
    console.log('Connected to the database:', res.rows[0].now);
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });

  module.exports = pool;
