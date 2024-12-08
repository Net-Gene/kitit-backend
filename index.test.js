// "jest" pg (PostgreSQL) -kirjastoa
// Tässä käytetään jestiä (testauskirjasto) simuloimaan pg-kirjaston Pool-oliota
// pg-kirjasto on PostgreSQL:n Node.js-ajureiden kirjasto
jest.mock('pg', () => {
  return {
    // "Pool" on pg-kirjaston tarjoama luokka, joka hallinnoi yhteyksiä PostgreSQL-tietokantaan
    Pool: jest.fn().mockImplementation(() => {
      return {
        // "query" on Pool-olion metodi, jota käytetään SQL-kyselyjen suorittamiseen tietokantaan
        // mockResolvedValue tarkoittaa, että metodi "query" palauttaa aina tämän arvon ilman oikeaa yhteyttä tietokantaan
        query: jest.fn().mockResolvedValue({ rows: [{ id: 1, name: 'Product 1' }] }), // mockattu vastaus
      };
    }),
  };
});

const request = require('supertest'); // supertest on testauskirjasto HTTP-pyyntöjen simulointiin
const app = require('./index'); // Tuo Express-sovelluksesi, joka sisältää API-reitit ja logiikan

describe('GET /api/products/get-products', () => { // Testataan GET-pyyntöä reitille '/api/products/get-products'
  it('should return a 200 status and products data', async () => {
    // Suoritetaan GET-pyyntö /api/products/get-products-reitille
    const response = await request(app).get('/api/products/get-products');

    // Testataan, että pyyntö palauttaa HTTP-tilan 200 (OK)
    expect(response.status).toBe(200);
    // Varmistetaan, että palautettu data on taulukko
    expect(Array.isArray(response.body)).toBe(true);
    // Testataan, että palautetussa datassa on ainakin yksi tuote
    expect(response.body.length).toBeGreaterThan(0);
    // Varmistetaan, että ensimmäisellä tuotteella on oikeat ominaisuudet (id ja name)
    expect(response.body[0]).toHaveProperty('id', 1);
    expect(response.body[0]).toHaveProperty('name', 'Product 1');
  });
});
