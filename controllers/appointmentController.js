const bcrypt = require('bcrypt'); // Salasanan suolaus ja tarkistus bcrypt-kirjaston avulla
const jwt = require('jsonwebtoken'); // JSON Web Token (JWT) autentikointia varten
const pool = require('../config/db'); // PostgreSQL-tietokannan yhteyden muodostaminen

// Funktio, joka hakee varatut aikarajat tietylle päivälle
const getReservedAppointments = async (req, res) => {
    const { date } = req.query; // Haetaan "date"-parametri querystringistä

    // Tarkistetaan, että päivämäärä on annettu
    if (!date) {
        return res.status(400).json({ message: 'Date is required.' }); // Palautetaan virheilmoitus, jos päivämäärää ei ole annettu
    }
  
    try {
      // Varmista, että päivämäärä on oikeassa muodossa (esim. vvvv-KK-pp)
      console.log('Received date:', date);  // Virheenkorjaus, tarkistetaan mitä päivämäärä on

      // Suoritetaan SQL-kysely, joka hakee varatut aikarajat tietyltä päivältä
      const reservedResult = await pool.query(
          `SELECT start_time, end_time 
           FROM appointments 
           WHERE DATE(date) = $1;`, // Tässä vertaillaan syötettyä päivämäärää tietokannan päivämäärään
  
          [date] // Varmistetaan, että päivämäärä on annettu merkkijonona vvvv-KK-pp-muodossa
      );

      // Mappedetaan tulokset haluttuun muotoon (aikaväli: start_time ja end_time)
      const reservedSlots = reservedResult.rows.map(row => ({
          start_time: row.start_time,
          end_time: row.end_time
      }));
  
      res.json({ reservedSlots }); // Palautetaan varatut aikarajat asiakkaalle
    } catch (error) {
      console.error('Error fetching reserved slots:', error); // Virheenkäsittely
      res.status(500).json({ message: 'Internal server error.' }); // Jos kysely epäonnistuu, palautetaan virheilmoitus
    }
};
  
// Funktio, joka varaa uuden tapaamisen tietokantaan
const bookAppointment = async (req, res) => {
    const { date, user_id, start_time, end_time } = req.body; // Haetaan syöte asiakkaalta

    // Tarkistetaan, että kaikki tarvittavat kentät on täytetty
    if (!date || !user_id || !start_time || !end_time) {
      return res.status(400).json({ message: 'Date, start_time, end_time, and user_id are required.' }); // Virhe, jos joku kenttä puuttuu
    }
  
    try {
      // Tarkistetaan, onko aikavälille jo varattu tapaaminen
      const result = await pool.query(
        `SELECT * FROM appointments 
         WHERE date = $1 AND start_time < $2 AND end_time > $2`, // Haetaan tapaamiset, joissa aikaväli menee päällekkäin annetun start_time:n kanssa
        [date, start_time]
      );

      // Jos aikaväliin on jo varattu tapaaminen, palautetaan virheilmoitus
      if (result.rows.length > 0) {
        return res.status(409).json({ message: 'Aika on jo varattu.' });
      }
  
      // Jos ei ole ristiriitaa, lisätään uusi tapaaminen tietokantaan
      await pool.query(
        `INSERT INTO appointments (date, user_id, start_time, end_time) 
         VALUES ($1, $2, $3, $4)`,
        [date, user_id, start_time, end_time] // Välitetään tiedot tietokantaan
      );
  
      res.status(201).json({ message: 'Appointment booked successfully.' }); // Ilmoitetaan onnistumisesta
    } catch (error) {
      console.error('Error booking appointment:', error); // Virheenkäsittely
      res.status(500).json({ message: 'Internal server error.' }); // Jos kysely epäonnistuu, palautetaan virheilmoitus
    }
};
  

module.exports = { getReservedAppointments, bookAppointment}; // Viedään funktiot ulos käytettäväksi muissa osissa sovellusta
