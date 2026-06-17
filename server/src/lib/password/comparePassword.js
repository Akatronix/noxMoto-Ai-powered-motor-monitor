const bcrypt = require("bcryptjs");

async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

module.exports = {
  comparePassword,
};
