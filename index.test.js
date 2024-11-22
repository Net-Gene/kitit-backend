const request = require('supertest');
const app = require('./index');  // Varmista, että sovelluksesi on viety index.js:stä


describe('GET /', () => {
  let server;

  beforeAll(() => {
    // Käynnistä palvelin ennen kaikkia testejä

    server = app.listen(3001);  // Varmista, että palvelin kuuntelee

  });

  afterAll((done) => {
    // Sulje palvelin kaikkien testien jälkeen

    server.close(done);
  });

  it('should return a 200 status and products data', async () => {
    const response = await request(server).get('/');  // Käytä palvelinesiintymää suoraan

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);  // Olettaen, että tuotteet palautetaan joukkona

  });
});
