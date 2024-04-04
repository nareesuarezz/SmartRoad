const express = require("express");
const cors = require("cors");
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
const dbConfig = require("./config/db.config");

const PORT = process.env.PORT || 3000;

const app = express();

// Sequelize setup
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: dbConfig.pool
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/images')));
app.use('/sounds', express.static(path.join(__dirname, 'public/sounds')));

var corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require("./models");

// Database sync and setup
db.sequelize.sync({ force: true }).then(async () => {
  console.log("Database tables dropped and re-synced.");

  const existingAdmin = await db.Admin.findOne({ where: { Username: 'prueba' } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('prueba', 10);
    const hashedPasswordUs = await bcrypt.hash('carmelo', 10);

    const createdAdmin = await db.Admin.create({
      Username: 'prueba',
      Password: hashedPassword,
      filename: 'user.png',
      Role: 'Admin'
    });

    const createdUser = await db.Admin.create({
      Username: 'carmelo',
      Password: hashedPasswordUs,
      filename: 'user.png',
      Role: 'User'
    })

    const createdSound1 = await db.Sounds.create({
      filename: 'sound1.mp3'
    });
    const createdSound2 = await db.Sounds.create({
      filename: 'sound2.mp3'
    });
    const createdSound3 = await db.Sounds.create({
      filename: 'sound3.mp3'
    });

    console.log('Admin predeterminado creado con éxito.');
    console.log('Admin Details:', createdAdmin.toJSON());
    console.log('User Details:', createdUser.toJSON());
    console.log('Sound1 Details:', createdSound1.toJSON());
    console.log('Sound2 Details:', createdSound2.toJSON());
    console.log('Sound3 Details:', createdSound3.toJSON());
  }
});

app.use(function (req, res, next) {
  var token = req.headers['authorization'];

  if (token && token.indexOf('Basic ') === 0) {
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password, role] = credentials.split(':');

    console.log('Decoded Credentials:', username, password, role);

    req.body.Username = username;
    req.body.Password = password;
    req.body.Role = role;
    req.bodyb = {};
    req.bodyb.Username = username;
    req.bodyb.Password = password;
    req.bodyb.Role = role;

    return next();
  }

  if (token) {
    token = token.replace('Bearer ', '');
    jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
      if (err) {
        return res.status(401).json({
          error: true,
          message: "Invalid user."
        });
      } else {
        req.user = user;
        req.token = token;
        next();
      }
    });
  } else {
    next();
  }
});

const SERVER = http.createServer(app);

const io = socketIo(SERVER, {
  cors: {
    origin: "*", // Adjust according to your needs
    methods: ["GET", "POST"]
  }
});

// Socket.IO setup for global notifications
io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('disconnect', () => {
    console.log('WebSocket client disconnected');
  });
});

// Function to send global notifications
function sendGlobalNotification(message) {
  io.emit('globalNotification', message);
}

//Testing notifications /get
app.get('/test-notification', (req, res) => {
  sendGlobalNotification('This is a test notification');
  res.send('Test notification sent');
});

// Endpoint para enviar una notificación global
app.post('/send-notification', (req, res) => {
  try {
    const message = req.body;
    console.log("Socorro")

    console.log(message)
    sendGlobalNotification(message);
    res.send('Notificación enviada');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
});

require("./routes/sounds.routes")(app);
require("./routes/logs.routes")(app);
require("./routes/tracks.routes")(app);
require("./routes/vehicles.routes")(app);
require("./routes/admins.routes")(app);
require("./routes/subscription.routes")(app);

SERVER.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  sendGlobalNotification("Server has started!!!!!!!!!!!!!!"); // Sending a notification when server starts
});

app.get('/', (req, res) => {
  res.send('Bienvenido a mi aplicación!');
});


module.exports = (req, res) => {
  const { method, url } = req;
  if (url.startsWith('/socket.io/')) {
    io.attach(req, res);
  } else {
    app.handle(req, res);
  }
};
