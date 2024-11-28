require('dotenv').config();
const express = require('express');
const cors = require('cors');  
const { Pool } = require('pg');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));  // Ota CORS käyttöön kaikissa pyynnöissä


app.use(express.json());  //Lisää tämä saapuvien JSON-pyyntöjen jäsentämiseen

app.use(cookieParser());



// Lisää rekisteröintilogiikan
app.post('/api/register', async (req, res) => {

  console.log('Request body:', req.body); //  Debugaus

  const { username, password } = req.body;
  if (!username || !password) {
    console.error('Missing username or password'); //  Debugaus
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
      [username, hashedPassword]
    );
    console.log('User registered with ID:', result.rows[0].id); //  Debugaus
    res.status(201).json({ message: 'User registered successfully', userId: result.rows[0].id });
  } catch (error) {
    console.error('Error registering user:', error); //  Debugaus
    if (error.code === '23505') {
      res.status(409).json({ message: 'Username already exists.' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});


// Lisää Loginlogiikan
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = userResult.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Luo JWT tokenin
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Laittaa tokenin HttpOnly cookieen
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Lisää Logoutlogiikan
app.post('/api/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.status(200).json({ message: 'Logged out successfully' });
});


// Vahvistaa JWT tokenit
const authenticateToken = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = user; // Liittää käyttäjän tiedot requestiin
    next();
  });
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM public.products ORDER BY id ASC ');
  res.send(result.rows);
});

//Lisää tuotelogiikka ostoskoriin

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


// Poista tuote ostoskorista

app.delete('/remove-from-cart', async (req, res) => {
  const { orderId, productId } = req.body;

  if (!orderId || !productId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Hae tuotteen hinta
    const itemResult = await client.query(
      'SELECT price FROM order_items WHERE order_id = $1 AND product_id = $2',
      [orderId, productId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found in the cart' });
    }

    const itemPrice = parseFloat(itemResult.rows[0].price);

    // Poistetaan tuote kohdasta order_items
    await client.query(
      'DELETE FROM order_items WHERE order_id = $1 AND product_id = $2',
      [orderId, productId]
    );

    // Päivitetään kokonaishinta kohdassa orders
    await client.query(
      'UPDATE orders SET total_price = total_price - $1 WHERE id = $2',
      [itemPrice, orderId]
    );

    await client.query('COMMIT');

    res.status(200).json({ message: 'Product removed from cart successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error removing product from cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});


//Hanki tilauksia

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
      const result = await pool.query(query, [req.user.userId]);
      res.json(result.rows); // Lähetä yhdistetyt tiedot JSON-muodossa

  } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

//Käynnistä palvelin vain, jos emme ole testiympäristössä
if (process.env.NODE_ENV !== 'test') {
  app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
  });
}

module.exports = app; //Vie sovellus testausta varten

