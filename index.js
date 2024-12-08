// Ladataan ympäristömuuttujat .env-tiedostosta
require('dotenv').config(); 

// Tuodaan tarvittavat kirjastot
const express = require('express');  // Express.js - palvelinrunko
const cors = require('cors');  // CORS (Cross-Origin Resource Sharing) -reittien rajoitusten hallintaan
const cookieParser = require('cookie-parser');  // Evästeiden käsittelyyn

// Tuodaan reitit
const authRoutes = require('./routes/authRoutes');  // Reitit autentikaatiolle
const userRoutes = require('./routes/userRoutes');  // Reitit käyttäjien käsittelyyn
const productRoutes = require('./routes/productRoutes');  // Reitit tuotteiden käsittelyyn
const appointmentRoutes = require('./routes/appointmentRoutes');  // Reitit ajanvarauksille

// Luodaan Express-sovellus
const app = express();

// Middleware

// CORS-middleware, joka sallii pyynnöt vain tietyltä alkuperältä (localhost:3000)
app.use(cors({
  origin: 'http://localhost:3000',  // Määritellään sallitut alkuperät
  credentials: true  // Sallitaan evästeiden lähettäminen
}));

// Middleware JSON-pyynnöille, joka jäsentää saapuvan JSON-datan
app.use(express.json()); 

// Middleware evästeiden käsittelyyn
app.use(cookieParser());

// Reitit, jotka määrittelevät, mihin URL-reitteihin pyynnöt ohjataan
app.use('/api/auth', authRoutes);  // Käyttäjän autentikaatio-reitit
app.use('/api/user', userRoutes);  // Käyttäjätiedot ja hallinta
app.use('/api/products', productRoutes);  // Tuotetiedot
app.use('/api/appointments', appointmentRoutes);  // Ajanvaraukset

// Käynnistetään palvelin vain, jos ympäristönä ei ole 'test'
if (process.env.NODE_ENV !== 'test') {
  // Palvelimen käynnistys localhost:3001 portilla
  app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
  });
}

// Exports the app for testing
module.exports = app; // Viedään app, jotta se voidaan testata

