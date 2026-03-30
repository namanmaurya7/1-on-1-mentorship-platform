const jwt = require("jsonwebtoken");

const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("No token"));
  }

  try {
    const decoded = jwt.decode(token); // Supabase JWT
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
};

module.exports = socketAuth;