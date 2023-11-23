const express = require("express");
const cors = require("cors");
const path = require('path');
const bcrypt = require('bcryptjs')
require('dotenv').config();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken'); 

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/images')));

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require("./models");

db.sequelize.sync({ force: true }).then(async () => {
  console.log("Database tables dropped and re-synced.");

  const existingAdmin = await db.Admin.findOne({ where: { Username: 'prueba' } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('prueba', 10);
    await db.Admin.create({ Username: 'prueba', Password: hashedPassword });

    console.log('Admin predeterminado creado con éxito.');
  }
});

// In all future routes, this helps to know if the request is authenticated or not.
app.use(function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['authorization'];

  // Imprime el encabezado de autorización
  console.log('Authorization Header:', token);

  if (token && token.indexOf('Basic ') === 0) {
    // verify auth basic credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    // Imprime las credenciales decodificadas
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
    // .env should contain a line like JWT_SECRET=V3RY#1MP0RT@NT$3CR3T#
    jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
      if (err) {
        return res.status(401).json({
          error: true,
          message: "Invalid user."
        });
      } else {
        req.user = user; // set the user to req so other routes can use it
        req.token = token;
        next();
      }
    });
  } else {
    // Handle the case where no authorization header is present
    next();
  }
});

// Require routes for each model
require("./routes/logs.routes")(app);
require("./routes/tracks.routes")(app);
require("./routes/vehicles.routes")(app);
require("./routes/admins.routes")(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
