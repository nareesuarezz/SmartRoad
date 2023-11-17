const express = require("express");
const cors = require("cors");
const path = require('path');

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

db.sequelize.sync({ force: true }).then(() => {
  console.log("Database tables dropped and re-synced.");
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application." });
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
