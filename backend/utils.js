var jwt = require('jsonwebtoken');
 
function generateToken(admin) {

  if (!admin) return null;
 
  var u = {
    UID: admin.UID,
    Username: admin.Username,
    Password: admin.Password,
    filename: admin.filename
  };
 
  return jwt.sign(u, process.env.JWT_SECRET, {
    expiresIn: 60 * 60 * 24 
  });
}
 
function getCleanUser(admin) {
  if (!admin) return null;
 
  return {
    UID: admin.UID,
    Username: admin.Username,
    Password: admin.Password,
    filename: admin.filename
  };
}
 
module.exports = {
  generateToken,
  getCleanUser
}