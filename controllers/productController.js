const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const addToCart = async (req, res) => {
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
};
const removeFromCart = async (req, res) => {
    const { productId, orderId } = req.body;
    const userId = req.user.userId;
  
    if (!productId || !orderId) {
      return res.status(400).json({ message: 'Tuotetunnus tai tilaustunnus puuttuu' });
  }
    if (!productId) {
      return res.status(400).json({ message: 'Tuotetunnus puuttuu' });
    }
  
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      // Hae nykyisen käyttäjän odottavassa tilauksessa olevan tuotteen hinta ja ID
  
      const itemResult = await client.query(
        `
        SELECT oi.price, oi.order_id 
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.product_id = $1 AND o.user_id = $2 AND o.status = 'Pending'
        LIMIT 1;
        `,
        [productId, userId]
      );
  
      if (itemResult.rows.length === 0) {
        return res.status(404).json({ message: 'Tuotetta ei löydy ostoskorista' });
      }
  
      const { price, order_id: orderId } = itemResult.rows[0];
  
      // Poistetaan tuote kohdasta order_items
  
      await client.query(
        'DELETE FROM order_items WHERE order_id = $1 AND product_id = $2',
        [orderId, productId]
      );
  
      // Päivitetään kokonaishinta kohdassa orders
  
      await client.query(
        'UPDATE orders SET total_price = total_price - $1 WHERE id = $2',
        [price, orderId]
      );
  
      await client.query('COMMIT');
      res.status(200).json({ message: 'Product removed successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error removing product from cart:', error);
      res.status(500).json({ message: 'Internal server error' });
    } finally {
      client.release();
    }
};

const getOrders = async (req, res) => {
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
          WHERE orders.user_id = $1 AND orders.status = $2
          ORDER BY orders.id ASC;
      `;
      const result = await pool.query(query, [req.user.userId, 'Pending']);
      res.json(result.rows); // Lähetä suodatetut tilaukset JSON-muodossa
  
  
  } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};
const completeOrders = async (req, res) => {
  const { orderId } = req.body;
  
  if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
  }
  
  const client = await pool.connect();
  
  try {
      await client.query('BEGIN');
  
      // Tarkista, onko tilaus olemassa ja kuuluuko se käyttäjälle
  
      const orderResult = await client.query(
          'SELECT * FROM orders WHERE id = $1 AND user_id = $2 AND status = $3',
          [orderId, req.user.userId, 'Pending']
      );
  
      if (orderResult.rows.length === 0) {
          return res.status(404).json({ message: 'Order not found or not valid for completion' });
      }
  
      // Päivitä tilauksen tila
  
      await client.query(
          'UPDATE orders SET status = $1 WHERE id = $2',
          ['Completed', orderId]
      );
  
      await client.query('COMMIT');
      res.status(200).json({ message: 'Order completed successfully' });
  } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error completing order:', error);
      res.status(500).json({ message: 'Internal server error' });
  } finally {
      client.release();
  }
};
const getProducts = async (req, res) => {
  const result = await pool.query('SELECT * FROM public.products ORDER BY id ASC ');
  res.send(result.rows);
};

module.exports = { addToCart, removeFromCart, getOrders, completeOrders, getProducts};
