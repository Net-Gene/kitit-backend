const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Päivittää käyttäjätunnuksen
const updateUsername = async (req, res) => {
  const { username, userId } = req.body;

  // Tarkistetaan, että käyttäjätunnus on annettu
  if (!username) {
      return res.status(400).json({ message: 'Username is required.' });
  }

  const client = await pool.connect(); // Yhteys tietokantaan

  try {
      await client.query('BEGIN'); // Aloita tietokantatapahtuma

      // Tarkistetaan, onko käyttäjätunnus jo olemassa
      const usernameCheck = await client.query(
          'SELECT id FROM users WHERE username = $1',
          [username]
      );

      if (usernameCheck.rowCount > 0 && usernameCheck.rows[0].id !== userId) {
          // Jos tunnus löytyy ja se ei ole tämän käyttäjän oma, palauta virhe
          return res.status(409).json({ message: 'Username already exists.' });
      }

      // Päivitetään käyttäjätunnus
      const result = await client.query(
          'UPDATE users SET username = $1 WHERE id = $2 RETURNING *',
          [username, userId]
      );

      // Jos käyttäjää ei löydy, peruuta muutos
      if (result.rowCount === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ message: 'User not found.' });
      }

      await client.query('COMMIT'); // Tapahtuma onnistui, sitoutetaan muutokset
      res.status(200).json({ message: 'Username updated successfully' });
  } catch (error) {
      await client.query('ROLLBACK'); // Jos virhe tapahtuu, perutaan tapahtuma
      console.error('Error updating username:', error);
      res.status(500).json({ message: 'Internal server error' });
  } finally {
      client.release(); // Vapautetaan tietokantayhteys
  }
};

// Päivittää salasanan
const updatePassword = async (req, res) => {
    const { password, userId } = req.body;

    // Tarkistetaan, että salasana on annettu
    if (!password) {
        return res.status(400).json({ message: 'Password is required.' });
    }

    const client = await pool.connect(); // Yhteys tietokantaan

    try {
        await client.query('BEGIN'); // Aloita tietokantatapahtuma

        // Salasanan salaaminen bcryptillä
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING *', 
            [hashedPassword, userId]
        );

        // Jos käyttäjää ei löydy, palautetaan virhe
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Päivittää käyttäjän sähköpostin
const updateEmail = async (req, res) => {
    const { email, userId } = req.body;
  
    // Tarkistetaan, että sähköpostiosoite on annettu
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
  
    const client = await pool.connect(); // Yhteys tietokantaan

    try {
      await client.query('BEGIN'); // Aloita tietokantatapahtuma

      const result = await pool.query(
        'UPDATE users SET email = $1 WHERE id = $2 RETURNING *', 
        [email, userId]
      );
  
      // Jos käyttäjää ei löydy, palautetaan virhe
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      res.status(200).json({ message: 'Email updated successfully' });
    } catch (error) {
      console.error('Error updating email:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
};

// Poistaa käyttäjän tilin
const deleteAccount = async (req, res) => {
    const { userId } = req.body; // Käyttäjän ID, jonka halutaan poistaa

    // Tarkistetaan, että käyttäjän ID on annettu
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }
  
    const client = await pool.connect(); // Yhteys tietokantaan

    try {
      await client.query('BEGIN'); // Aloita tietokantatapahtuma

      // Poistetaan käyttäjä tietokannasta
      const result = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING *',
        [userId]
      );
  
      // Jos käyttäjää ei löydy, palautetaan virhe
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      await client.query('COMMIT'); // Sitoutetaan muutokset
  
      res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
      await client.query('ROLLBACK'); // Jos virhe tapahtuu, perutaan muutokset
      console.error('Error deleting account:', error);
      res.status(500).json({ message: 'Internal server error' });
    } finally {
      client.release(); // Vapautetaan tietokantayhteys
    }
};
  

module.exports = { updateUsername, updatePassword, updateEmail, deleteAccount};
