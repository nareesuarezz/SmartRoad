const request = require('supertest');
const httpStatus = require('http-status');
const { app } = require('../index.js');
const { sequelize } = require('../models');

describe('Admin routes', () => {
  // Assuming your database is set up with a clean state before running tests

  describe('POST /api/admins', () => {
    test('should create a new admin with valid data', async () => {
      const res = await request(app)
        .post('/api/admins')
        .field('Username', 'newadmin')
        .field('Password', 'newpassword')
        .attach('filename', './public/images/user.jpg')
        .expect(httpStatus.OK);

      // Additional assertions if needed
      expect(res.body.admin).toHaveProperty('Username', 'newadmin');
      expect(res.body).toHaveProperty('access_token');
    });
    
    test('should return 500 if admin with the same username already exists', async () => {
      // Assuming there is an admin with the username 'testadmin' in the database
      const res = await request(app)
        .post('/api/admins')
        .field('Username', 'testadmin')
        .field('Password', 'newpassword')
        .expect(httpStatus.INTERNAL_SERVER_ERROR);

      // Additional assertions if needed
      expect(res.body).toHaveProperty('message');
    });
  });
  // Add more test cases for other routes in a similar manner
});
