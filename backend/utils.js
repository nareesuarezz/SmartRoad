// generate token using secret from process.env.JWT_SECRET
var jwt = require('jsonwebtoken');
 
// generate token and return it
function generateToken(admin) {
  //1. Don't use password and other sensitive fields
  //2. Use the information that are useful in other parts
  if (!admin) return null;
 
  var u = {
    UID: admin.id,
    Username: admin.Username,
    Password: admin.Password,
    filename: admin.filename
  };
 
  // .env should contain a line like JWT_SECRET=V3RY#1MP0RT@NT$3CR3T#
  return jwt.sign(u, process.env.JWT_SECRET, {
    expiresIn: 60 * 60 * 24 // expires in 24 hours
  });
}
 
// return basic user details
function getCleanUser(admin) {
  if (!admin) return null;
 
  return {
    UID: admin.id,
    Username: admin.Username,
    Password: admin.Password,
    filename: admin.filename
  };
}
 
module.exports = {
  generateToken,
  getCleanUser
}