const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require("../models");
const Admin = db.Admin;
const utils = require('../utils');

exports.signin = async (req, res) => {
  const { Username, Password } = req.body;

  if (!Username || !Password) {
    return res.status(400).json({
      error: true,
      message: "Username and Password are required."
    });
  }

  try {
    const admin = await Admin.findOne({ where: { Username } });

    if (!admin) {
      return res.status(401).json({
        error: true,
        message: "Invalid credentials."
      });
    }

    const passwordMatch = bcrypt.compareSync(Password, admin.Password);

    if (!passwordMatch) {
      return res.status(401).json({
        error: true,
        message: "Invalid credentials."
      });
    }

    const token = utils.generateToken(admin);
    const adminDetails = utils.getCleanUser(admin);

    res.json({ admin: adminDetails, access_token: token });
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({
      error: true,
      message: "Internal Server Error."
    });
  }
};

exports.isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      error: true,
      message: "Token is required."
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({
        error: true,
        message: "Invalid token."
      });
    }

    try {
      const admin = await Admin.findByPk(decoded.adminId);

      if (!admin) {
        return res.status(401).json({
          error: true,
          message: "Invalid admin."
        });
      }

      req.admin = { UID: decoded.adminId };
      next();
    } catch (error) {
      console.error("Error during authentication:", error);
      res.status(500).json({
        error: true,
        message: "Internal Server Error."
      });
    }
  });
};
