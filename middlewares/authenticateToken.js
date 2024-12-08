const jwt = require('jsonwebtoken');

// authenticateToken-funktio, joka tarkistaa JWT-tunnisteen
const authenticateToken = (req, res, next) => {
  // Etsii evästeestä 'auth_token' -nimisen JWT-tokenin
  const token = req.cookies.auth_token;
  
  // Konsoliloki, joka näyttää pyynnössä olevan tokenin (helpottaa debuggausta)
  console.log('Token in request:', token); // Tämän pitäisi näyttää evästeen tunnus

  // Jos tokenia ei löydy, palautetaan 401 Unauthorized virhe
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  // Verifioidaan token, eli tarkistetaan sen aitous ja puramme siitä käyttäjätiedot
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    // Jos token on virheellinen (esim. vanhentunut tai manipuloitu), palautetaan 403 Forbidden virhe
    if (err) {
      return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }

    // Jos token on validi, liitetään käyttäjätiedot pyyntöön
    req.user = user; // Liitä käyttäjätiedot pyyntöön, jotta niitä voidaan käyttää myöhemmin reitissä

    // Jatketaan seuraavaan middlewareen tai reittikäsittelijään
    next();
  });
};

// Exporteeraa authenticateToken-funktio, jotta se voidaan käyttää muualla sovelluksessa
module.exports = authenticateToken;