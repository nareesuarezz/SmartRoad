const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require("../models");
const Admin = db.Admin;
const utils = require('../utils');

exports.signin = async (req, res) => {
  const { Username, Password } = req.body;

  // Verificar si el usuario y la contraseña están presentes
  if (!Username || !Password) {
    return res.status(400).json({
      error: true,
      message: "Username and Password are required."
    });
  }

  try {
    // Buscar el admin por su nombre de usuario
    const admin = await Admin.findOne({ where: { Username } });

    if (!admin) {
      return res.status(401).json({
        error: true,
        message: "Invalid credentials."
      });
    }

    // Comparar las contraseñas
    const passwordMatch = bcrypt.compareSync(Password, admin.Password);

    if (!passwordMatch) {
      return res.status(401).json({
        error: true,
        message: "Invalid credentials."
      });
    }

    // Generar el token
    const token = utils.generateToken(admin);
    // Obtener detalles básicos del admin
    const adminDetails = utils.getCleanUser(admin);

    // Enviar el token y detalles del admin en la respuesta
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
  // Obtener el token del encabezado de la solicitud
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      error: true,
      message: "Token is required."
    });
  }

  // Verificar el token utilizando la clave secreta
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({
        error: true,
        message: "Invalid token."
      });
    }

    try {
      // Buscar el admin en la base de datos
      const admin = await Admin.findByPk(decoded.adminId);

      if (!admin) {
        return res.status(401).json({
          error: true,
          message: "Invalid admin."
        });
      }

      // Añadir la información del admin a la solicitud
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
