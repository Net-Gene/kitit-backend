require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

// Middleware

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json()); // Jäsennetään saapuvaa JSON-tiedostoa

app.use(cookieParser());

// Reitit

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/appointments', appointmentRoutes);

//Käynnistä palvelin vain, jos emme ole testiympäristössä


if (process.env.NODE_ENV !== 'test') {
  app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
  });
}
