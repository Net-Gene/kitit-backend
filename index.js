require('dotenv').config();
const express = require('express');
const cors = require('cors');  
const { Pool } = require('pg');

const app = express();
app.use(cors());  // Enable CORS on all requests


app.use(express.json());  // Add this to parse incoming JSON requests



const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM public.products ORDER BY id ASC ');
  res.send(result.rows);
});

// Add Product Logic to cart


app.post('/add-to-cart', async (req, res) => {
  const { productId, quantity, userId } = req.body;

  if (!productId || !quantity || !userId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const client = await pool.connect(); // Aloita tietokantatapahtuma

  try {
    await client.query('BEGIN'); // Aloita kauppa


    // Tarkista, onko käyttäjälle olemassa tilaus

    const orderResult = await client.query(
      'SELECT * FROM orders WHERE user_id = $1 AND status = $2 LIMIT 1',
      [userId, 'Pending']
    );
    let order;

    if (orderResult.rows.length === 0) {
      // Jos odottavaa tilausta ei ole, luo uusi

      const newOrderResult = await client.query(
        'INSERT INTO orders (user_id, total_price, status) VALUES ($1, $2, $3) RETURNING id',
        [userId, 0, 'Pending']
      );
      order = { id: newOrderResult.rows[0].id }; // Pura tilaustunnus

    } else {
      order = orderResult.rows[0];
    }

    // Varmista, että tilaustunnus on kelvollinen

    if (!order.id) {
      throw new Error('Order ID is not valid.');
    }

    // Hae tuote

    const productResult = await client.query('SELECT * FROM products WHERE id = $1', [productId]);
    const product = productResult.rows[0];

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Laske tuotteen kokonaishinta

    const price = parseFloat(product.price) * quantity;

    // Lisää tuote kohtaan order_items

    await client.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
      [order.id, productId, quantity, price]
    );

    // Päivitä tilauksen kokonaishinta

    await client.query(
      'UPDATE orders SET total_price = total_price + $1 WHERE id = $2',
      [price, order.id]
    );

    await client.query('COMMIT'); // Sitouta kauppa


    res.status(200).json({ message: 'Product added to cart successfully', orderId: order.id });
  } catch (error) {
    await client.query('ROLLBACK'); // Peruuta tapahtuma, jos siinä on virhe

    console.error('Error adding product to cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release(); // Vapauta aina tietokantaasiakas

  }
});



// Get orders

app.get('/orders', async (req, res) => {
  try {
      const query = `
          SELECT 
              orders.id AS order_id,
              orders.total_price,
              orders.status,
              order_items.product_id,
              order_items.quantity,
              order_items.price AS item_price,
              products.name AS product_name,
              products.description AS product_description
          FROM orders
          JOIN order_items ON orders.id = order_items.order_id
          JOIN products ON order_items.product_id = products.id
          ORDER BY orders.id ASC;
      `;
      const result = await pool.query(query);
      res.json(result.rows); // Lähetä yhdistetyt tiedot JSON-muodossa

  } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
