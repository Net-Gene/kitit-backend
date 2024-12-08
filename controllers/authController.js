const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Rekisteröinti: Luodaan uusi käyttäjä ja tallennetaan salasanan hajautus
const register = async (req, res) => {
  const { username, password } = req.body;

  // Tarkistetaan, että käyttäjätunnus ja salasana on lähetetty
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Salasanan hajautus bcryptillä (10 = suola, joka tekee hajautuksesta vahvemman)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Käytetään PostgreSQL:n poolia tietokannan kyselyihin
    const result = await pool.query(
      "INSERT INTO public.users(username, password_hash) VALUES ($1, $2) RETURNING id;",  // Sisäänkirjautumista varten lisätään käyttäjä
      [username, hashedPassword]
    );

    // Vastaus, kun käyttäjä on onnistuneesti lisätty
    res.status(201).json({ message: 'User registered successfully', userId: result.rows[0].id });
  } catch (error) {
    // Virhe käsittelyt, jos tietokannan kyselyssä tulee ongelma
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Kirjautuminen: Tarkistetaan käyttäjätunnus ja salasana
const login = async (req, res) => {
  const { username, password } = req.body;

  // Tarkistetaan, että käyttäjätunnus ja salasana on lähetetty
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Haetaan käyttäjä tietokannasta
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = userResult.rows[0];

    // Tarkistetaan, että käyttäjä löytyy ja salasana vastaa
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Luodaan JSON Web Token (JWT) joka sisältää käyttäjän ID:n
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Lähetetään token evästeenä selaimelle
    res.cookie('auth_token', token, {
      httpOnly: true, // Eväste ei ole JavaScriptin saatavilla
      secure: process.env.NODE_ENV === 'production', // Varmistetaan, että eväste on turvallinen vain tuotantoympäristössä
      sameSite: 'Strict', // Estetään evästeen lähettäminen kolmannen osapuolen sivuilta
    });

    // Vastaus onnistuneesta kirjautumisesta
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    // Virhe käsittelyt, jos jotain menee pieleen
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Evästeen tyhjennys, käyttäjä uloskirjautuu
const clearCookie = async (req, res) => {
  // Poistetaan auth_token eväste
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/', // Eväste poistetaan kaikilta poluilta
  });
  
  // Vastaus uloskirjautumisesta
  res.status(200).json({ message: 'Cookies cleared out successfully' });
};

// Tarkistetaan käyttäjän JWT ja varmennetaan käyttäjän tunnistaminen
const checkAuthToken = (req, res) => {
  // Logitaan käyttäjätunnus (voi olla hyödyllinen debuggaamisessa)
  console.log("req.user.userId " + req.user.userId);

  // Jos käyttäjä ei ole tunnistettu, palautetaan virhe
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Palautetaan käyttäjän ID, jos hän on tunnistettu oikein
  res.status(200).json({ userId: req.user.userId });
};

// Viedään rekisteröinti, kirjautuminen, evästeen tyhjennys ja tokenin tarkistus muihin tiedostoihin
module.exports = { register, login, clearCookie, checkAuthToken};
