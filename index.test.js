// "jest" pg (PostgreSQL) -kirjastoa

jest.mock('pg', () => {
    return {
      Pool: jest.fn().mockImplementation(() => {
        return {
          query: jest.fn().mockResolvedValue({ rows: [{ id: 1, name: 'Product 1' }] }),
        };
      }),
    };
  });
  
  const request = require('supertest');
  const app = require('./index'); // Tuo Express-sovelluksesi

  
  describe('GET /', () => {
    it('should return a 200 status and products data', async () => {
      const response = await request(app).get('/');
  
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id', 1);
      expect(response.body[0]).toHaveProperty('name', 'Product 1');
    });
  });
  