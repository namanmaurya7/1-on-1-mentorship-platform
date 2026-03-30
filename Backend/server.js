const express = require("express");
const cors = require("cors");
const supabase = require("./config/supabase.js");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth.js");
//const socketAuth = require("./middlewares/socketAuth.js");
const sessionRoutes = require("./routes/session.js");

const app = express();
const server = http.createServer(app);

// ✅ attach socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);
//io.use(socketAuth);


 
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("join-session", (sessionId) => {
    console.log("📥 Joining session:", sessionId, "Socket:", socket.id);
    socket.join(sessionId);
  });


  socket.on("code-change", ({ sessionId, code }) => {
  console.log("✏️ Code change:", code);

  socket.to(sessionId).emit("code-update", code);
});

  socket.on("send-message", async ({ sessionId, senderId, content }) => {
    console.log("💬 Message from", senderId, ":", content);

    const { data } = await supabase
      .from("messages")
      .insert([
        {
          session_id: sessionId,
          sender_id: senderId,
          content,
        },
      ])
      .select();

    console.log("📤 Emitting to room:", sessionId);

    socket.to(sessionId).emit("receive-message", data[0]);
    socket.emit("receive-message", data[0]);
  });


  // 🎥 WebRTC signaling

socket.on("offer", ({ offer, sessionId }) => {
  socket.to(sessionId).emit("offer", offer);
});

socket.on("answer", ({ answer, sessionId }) => {
  socket.to(sessionId).emit("answer", answer);
});

socket.on("ice-candidate", ({ candidate, sessionId }) => {
  socket.to(sessionId).emit("ice-candidate", candidate);
});

socket.on("disconnect", () => {
  console.log("❌ User disconnected:", socket.id);

  socket.broadcast.emit("user-disconnected");
});
});

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
