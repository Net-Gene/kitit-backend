const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const updateUsername = async (req, res) => {
    const { username, userId } = req.body;
    
    if (!username) {
        return res.status(400).json({ message: 'Username is required.' });
    }
    
    
    const client = await pool.connect(); // Aloita tietokantatapahtuma
    
    
    try {
        await client.query('BEGIN'); // Aloita 
    
    
        const result = await pool.query(
        'UPDATE users SET username = $1 WHERE id = $2 RETURNING *', 
        [username, userId]
        );
    
        if (result.rowCount === 0) {
        return res.status(404).json({ message: 'User not found.' });
        }
    
        res.status(200).json({ message: 'Username updated successfully' });
    } catch (error) {
        console.error('Error updating username:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updatePassword = async (req, res) => {
    const { password, userId } = req.body;

    if (!password) {
        return res.status(400).json({ message: 'Password is required.' });
    }


    const client = await pool.connect(); // Aloita tietokantatapahtuma


    try {
        await client.query('BEGIN'); // Aloita 


        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING *', 
        [hashedPassword, userId]
        );

        if (result.rowCount === 0) {
        return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateEmail = async (req, res) => {
    const { email, userId } = req.body;
  
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
  
  
    const client = await pool.connect(); // Aloita tietokantatapahtuma
  
  
    try {
      await client.query('BEGIN'); // Aloita 
  
  
      const result = await pool.query(
        'UPDATE users SET email = $1 WHERE id = $2 RETURNING *', 
        [email, userId]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      res.status(200).json({ message: 'Email updated successfully' });
    } catch (error) {
      console.error('Error updating email:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteAccount = async (req, res) => {
    const { userId } = req.body; // Tuhoa userId rungosta
  
  
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }
  
    const client = await pool.connect(); // Aloita tietokantatapahtuma
  
  
    try {
      await client.query('BEGIN'); // Aloita kauppa
  
  
  
      const result = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING *',
        [userId]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      await client.query('COMMIT'); // Sitouta tapahtuma
  
  
      res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
      await client.query('ROLLBACK'); // Rollback transaction on error
  
      console.error('Error deleting account:', error);
      res.status(500).json({ message: 'Internal server error' });
    } finally {
      client.release(); // Vapauta tietokantayhteys
  
    }
};
  

module.exports = { updateUsername, updatePassword, updateEmail, deleteAccount};
