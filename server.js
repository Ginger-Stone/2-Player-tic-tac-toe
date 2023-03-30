const { createServer } = require("http");
const { Server } = require("socket.io");

// List of all connected users
const userSockets = new Map();
const clients = {};
// Object to store pairs of engaged users
let engagedPairs = {};

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://127.0.0.1:5500",
    credentials: true,
  },
});

// Function to update engagedPairs object when a user engages with another user
function engageUser(user1, user2) {
  engagedPairs[user1] = user2;
  engagedPairs[user2] = user1;
}

// Function to remove a user from engagedPairs when they end their game
function endEngagement(user) {
  if (engagedPairs[user]) {
    const partner = engagedPairs[user];
    delete engagedPairs[user];
    delete engagedPairs[partner];
  }
}

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket}`);
  console.log(`Client connected: ${socket.id}`);

  // extract the user ID from the query parameters
  const userId = socket.handshake.query.userId;
  const username = socket.handshake.query.username;

  // socket.on("chatMessage", (msg) => {
  //   io.emit("chatMsg", msg);
  // });

  // Handle the 'connect' event from the client
  socket.on("connect", (data) => {
    console.log(`User ${userId} connected with username ${username}`);
  });

  // Handle userConnect from client
  socket.on("userConnect", (data) => {
    console.log(`User ${userId} connected with username ${username}`);

    // Save the username and ID as properties of the socket object
    socket.username = username;
    socket.userId = userId;
    let me = { userId: socket.userId, username: socket.username };

    // Add the client to the clients object with its socket id as the key
    clients[socket.userId] = {
      username: socket.username,
      userId: socket.userId,
      engaged: false, //true when a user is in a game
      room: "",
      // socket: socket, causing circular error
    };
    // add the socket instance from the map
    userSockets.set(userId, socket);

    // console.log(clients[socket.id]);

    // Emit a 'connected' event to all clients
    io.emit("userConnected", { me, clients });
  });

  // Handle the 'disconnect' event from the client
  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`);

    // Remove the client from the clients object
    delete clients[socket.userId];
    // remove the socket instance from the map
    userSockets.delete(userId);
    // end any engagements if exists
    endEngagement(userId);

    // Emit a 'disconnected' event to all clients
    io.emit("disconnected", {
      username: socket.username,
      userId: socket.userId,
    });
  });

  // When a user selects another user to play with
  socket.on("selectUser", ({ selectedUserId, meId }) => {
    console.log(clients);
    console.log(meId);
    console.log(selectedUserId);
    if (
      clients[meId].engaged ||
      clients[selectedUserId].engaged ||
      clients[meId].userId === clients[selectedUserId].userId
    ) {
      // The selected user is not available to play
      socket.emit("selectUserResponse", { success: false });
      return;
    }
    // Update the engaged of both users to "engaged"
    clients[meId].engaged = true;
    clients[selectedUserId].engaged = true;
    engageUser(meId, selectedUserId);
    // console.log("users engaged");
    // console.log(engagedPairs);

    // create room and add the two users -- get the engaged pairs to join a room together
    let roomId = meId + selectedUserId;
    clients[meId].room = roomId;
    clients[meId].playerNumber = 1;
    clients[selectedUserId].room = roomId;
    clients[selectedUserId].playerNumber = 2;
    // Get the socket associated with the user id
    const userSocket = userSockets.get(selectedUserId);
    // Join a private room with the selectedUserId and meId
    socket.join(roomId);
    userSocket.join(roomId);
    io.emit("selectUserResponse", {
      me: clients[meId],
      selectedUser: clients[selectedUserId],
      success: true,
    });
  });

  // Handle private chat messages
  socket.on("privateMessage", ({ sender, message }) => {
    // Send the message to the recipient only
    io.to(clients[sender].room).emit("privateMessage", {
      senderName: clients[sender].username,
      senderId: clients[sender].userId,
      message,
    });
  });

  // Handle player moves
  socket.on("playerMove", ({ sender, blockId }) => {
    // Send the move to the recipients only
    io.to(clients[sender].room).emit("playerMove", {
      senderName: clients[sender].username,
      senderId: clients[sender].userId,
      playerNumber: clients[sender].playerNumber,
      blockId,
    });
  });

  // Set current player
  socket.on("currentPlayer", ({ playerId }) => {
    // Send the move to the recipients only
    io.to(clients[playerId].room).emit("currentPlayer", {
      playerUsername: clients[playerId].username,
      playerId,
    });
  });

  // Start new game
  socket.on("newGame", ({ playerId, currentGridSize }) => {
    // Send the move to the recipients only
    io.to(clients[playerId].room).emit("newGame", {
      currentGridSize,
    });
    io.to(clients[playerId].room).emit("currentPlayer", {
      playerUsername: clients[playerId].username,
      playerId,
    });
  });
});

httpServer.listen(3000, () => {
  console.log("Server started on port 3000");
});
