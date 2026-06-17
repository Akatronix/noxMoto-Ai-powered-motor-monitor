const jwt = require("jsonwebtoken");

async function generateToken(data, secret, expiresIn) {
  return jwt.sign(data, secret, { expiresIn });
}

module.exports = {
  generateToken,
};
