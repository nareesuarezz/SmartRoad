const request = require('supertest');
const httpStatus = require('http-status');
const { app } = require('../index.js');
const { sequelize } = require('../models');

describe('Subscription routes', () => {
  // Assuming your database is set up with a clean state before running tests

    test('should return 400 if subscription data is invalid', async () => {
      const res = await request(app)
        .post('/api/subscriptions/subscribe')
        .expect(httpStatus.BAD_REQUEST);

      // Additional assertions if needed
    });
  });


