const jwt = require("jsonwebtoken");

const signToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });

module.exports = { signToken };
