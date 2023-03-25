const { createServer } = require("http");
const { Server } = require("socket.io");

// List of all connected users
const clients = {};

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://127.0.0.1:5500",
    credentials: true,
  },
});

// Function to generate a unique userId
function generateUserId() {
  return Math.random().toString(36).substring(2, 15);
}
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket}`);
  console.log(`Client connected: ${socket.id}`);

  const userId = generateUserId();

  socket.on("chatMessage", (msg) => {
    io.emit("chatMsg", msg);
  });

  // Handle the 'connect' event from the client
  socket.on("connect", (data) => {
    console.log(`User ${userId} connected with username ${data.username}`);
  });

  // Handle userConnect from client
  socket.on("userConnect", (data) => {
    console.log(`User ${userId} connected with username ${data.username}`);

    // Save the username and ID as properties of the socket object
    socket.username = data.username;
    socket.userId = userId;

    // Add the client to the clients object with its socket id as the key
    clients[socket.id] = {
      username: socket.username,
      userId: socket.userId,
      engaged: false, //true when a user is in a game
      // socket: socket, causing circular error
    };

    // console.log(clients[socket.id]);

    // Emit a 'connected' event to all clients
    io.emit("userConnected", clients);
  });

  // Handle the 'disconnect' event from the client
  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`);

    // Remove the client from the clients object
    delete clients[socket.id];

    // Emit a 'disconnected' event to all clients
    io.emit("disconnected", {
      username: socket.username,
      userId: socket.userId,
    });
  });
});

httpServer.listen(3000, () => {
  console.log("Server started on port 3000");
});
