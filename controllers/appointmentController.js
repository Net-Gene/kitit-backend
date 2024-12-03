const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const getReservedAppointments = async (req, res) => {
    const { date } = req.query;
    
    if (!date) {
        return res.status(400).json({ message: 'Date is required.' });
    }
  
    try {
      // Varmista, että päivämäärä välitetään oikeassa muodossa
  
      console.log('Received date:', date);  // Virheenkorjaus
  
      
      const reservedResult = await pool.query(
          `SELECT start_time, end_time 
           FROM appointments 
           WHERE DATE(date) = $1;`, // Vertaa aloitusajan päivämäärää syötettyyn päivämäärään
  
          [date] // Varmista, että päivämäärä välitetään merkkijonona vvvv-KK-pp-muodossa
  
      );
  
      const reservedSlots = reservedResult.rows.map(row => ({
          start_time: row.start_time,
          end_time: row.end_time
      }));
  
      res.json({ reservedSlots });
    } catch (error) {
      console.error('Error fetching reserved slots:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
};
  
const bookAppointment = async (req, res) => {
    const { date, user_id, start_time, end_time } = req.body;
  
    // Vahvista syötteet
  
    if (!date || !user_id || !start_time || !end_time) {
      return res.status(400).json({ message: 'Date, start_time, end_time, and user_id are required.' });
    }
  
    try {
      // Tarkista, onko annetulle aikavälille jo varattu tapaaminen
  
      const result = await pool.query(
        `SELECT * FROM appointments 
         WHERE date = $1 AND start_time < $2 AND end_time > $2`,
        [date, start_time]
      );
  
      if (result.rows.length > 0) {
        return res.status(409).json({ message: 'Aika on jo varattu.' });
      }
  
      // Lisää uusi tapaaminen, jos ristiriitaa ei ole
  
      await pool.query(
        `INSERT INTO appointments (date, user_id, start_time, end_time) 
         VALUES ($1, $2, $3, $4)`,
        [date, user_id, start_time, end_time]
      );
  
      res.status(201).json({ message: 'Appointment booked successfully.' });
    } catch (error) {
      console.error('Error booking appointment:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
};
  

module.exports = { getReservedAppointments, bookAppointment};
