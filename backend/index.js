const express = require("express");
const cors = require("cors");
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const http = require('http');
const https = require('https');
const socketIo = require('socket.io');
const dbConfig = require("./config/db.config");

const USING_HTTPS = process.env.USING_HTTPS == "true" ? true : false;
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 443;


const HTTP = express();

if (USING_HTTPS && PORT != 443) {
  HTTP.get("*", (req, res) =>
    res.redirect("https://" + process.env.HOST + ":" + process.env.PORT)
  );

  HTTP.listen(PORT);
}

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

var corsOptions = {
  origin: "*"
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

    const createdAdmin = await db.Admin.create({
      Username: 'prueba',
      Password: hashedPassword,
      filename: 'user.jpg'
    });

    console.log('Admin predeterminado creado con éxito.');
    console.log('Admin Details:', createdAdmin.toJSON());
  }
});

app.use(function (req, res, next) {
  var token = req.headers['authorization'];

  // // Imprime el encabezado de autorización
  // console.log('Authorization Header:', token);

  if (token && token.indexOf('Basic ') === 0) {
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    console.log('Decoded Credentials:', username, password);

    req.body.Username = username;
    req.body.Password = password;
    req.bodyb = {};
    req.bodyb.Username = username;
    req.bodyb.Password = password;

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

let SERVER = null;

if (USING_HTTPS) {
  const CERTS = () => {
    try {
      return {
        key: fs.readFileSync(path.join(__dirname, ".cert/cert.key")),
        cert: fs.readFileSync(path.join(__dirname, ".cert/cert.crt")),
      };
    } catch (err) {
      console.log("No certificates found: " + err);
    }
  };
  SERVER  = https.createServer(CERTS(), app);
} else {
  SERVER = http.createServer(app);
}



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


require("./routes/logs.routes")(app);
require("./routes/tracks.routes")(app);
require("./routes/vehicles.routes")(app);
require("./routes/admins.routes")(app);
require("./routes/subscription.routes")(app);

(USING_HTTPS ? SERVER : app).listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  sendGlobalNotification("Server has started!!!!!!!!!!!!!!"); // Sending a notification when server starts
});

module.exports = { app, io }; // Exporting app and io for use in other modules