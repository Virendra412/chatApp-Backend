const express = require("express");
const port = 3000;
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const app = express();
const User = require("./models/userModel");
const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const Message = require("./models/messageModel");
const { createServer } = require("http");
const { Server } = require("socket.io");
const userModel = require("./models/userModel");
const { validate } = require("./models/chatModel");
const { addNotificationForOffline } = require("./controllers/userController");
const server = createServer(app);

const io = new Server(server, {

  cors: {
    origin: ["http://localhost:5173",process.env.CLIENT_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },

});
// const io = new Server(server)
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => console.log(error));



let chatRoom = new Set();

/////sockets//////////////////////////////////////////////////
io.on("connection", (socket) => {
  console.log("connection established");
  console.log(socket.id);
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    chatRoom.add(userData._id);
    console.log(chatRoom);

    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined room: " + room);
  });

  socket.on("sendMessage", (mes) => {
    console.log("message received");

    mes.chat.users.forEach(async (userId) => {
      if (chatRoom.has(userId)) {
        socket.in(userId).emit("received", mes);
      } else {
        await addNotificationForOffline(userId, mes._id);
      }
    });
  });

  socket.on("disconnecting", async () => {
    console.log("user disconnectec");

    socket.rooms.forEach(async (v) => {
      if (chatRoom.has(v)) {
        chatRoom.delete(v);

        console.log(chatRoom);
      }
    });
  });
});

app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get("/api/servertest",(req,res)=>{
  res.send("server is running on vercel")
})
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
