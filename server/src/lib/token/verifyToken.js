const jsonwebtoken = require("jsonwebtoken");

function verifyToken(token, secret) {
  try {
    const decoded = jsonwebtoken.verify(token, secret);
    return decoded;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  verifyToken,
};
