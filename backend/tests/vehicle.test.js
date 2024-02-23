const request = require('supertest');
const httpStatus = require('http-status');
const { app } = require('../index.js'); // Change this line
const { sequelize } = require('../models');
test('should return 400 status if vehicle type is not car or bicycle', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .send({ Vehicle: 'truck' }) // 'truck' no es un tipo de vehículo válido
      .expect(httpStatus.BAD_REQUEST);
  
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe("El tipo de vehículo debe ser 'car' o 'bicycle'.");
  });
  