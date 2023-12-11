const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../index.js');
const { sequelize } = require('../models');

describe('Admin routes', () => {
  describe('POST /api/admins', () => {
    test('should return 500 if admin is created without password', async () => {
      const res = await request(app)
        .post('/api/admins')
        .attach('filename', './public/images/user.jpg')
        .field('Username', 'testadmin')
        .field('Password', '') 
        .expect(httpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
