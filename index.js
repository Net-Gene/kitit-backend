// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');  
const { Pool } = require('pg');

const app = express();
app.use(cors());  // Ota CORS käyttöön kaikille pyynnöille

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  res.send(result.rows);
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
