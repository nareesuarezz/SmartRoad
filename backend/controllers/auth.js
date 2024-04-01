const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require("../models");
const Admin = db.Admin;
const utils = require('../utils');
const path = require('path');
const fs = require('fs')

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

    // Añade el rol al objeto adminDetails
    adminDetails.Role = admin.Role;

    res.json({ admin: adminDetails, access_token: token });
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({
      error: true,
      message: "Internal Server Error."
    });
  }
};


exports.signup = async (req, res) => {
  const { Username, Password, Role, filename } = req.body;

  if (!Username || !Password || !Role) {
    return res.status(400).json({
      error: true,
      message: "Username, Password, and Role are required."
    });
  }

  try {
    const existingAdmin = await Admin.findOne({ where: { Username } });

    if (existingAdmin) {
      return res.status(400).json({
        error: true,
        message: "Username already exists."
      });
    }

    const hashedPassword = bcrypt.hashSync(Password, 8);

    let finalProfilePicture = 'user.png';

    const admin = await Admin.create({ Username, Password: hashedPassword, Role, filename: finalProfilePicture });

    const token = utils.generateToken(admin);
    const adminDetails = utils.getCleanUser(admin);

    // Añade el rol y la foto de perfil al objeto adminDetails
    adminDetails.Role = admin.Role;
    adminDetails.filename = admin.filename;

    res.json({ admin: adminDetails, access_token: token });
  } catch (error) {
    console.error("Error during sign-up:", error);
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
