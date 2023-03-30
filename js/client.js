// REMEMBER to run -> browserify client.js -o client-bundle.js <- whenever changes are made to this file
const config = require("../config.js");
const io = require("socket.io-client");
const { v4: uuidv4 } = require("uuid");

const playersOnline = document.getElementById("players-online");

const setCurrentPlayer = document.getElementById("current-player");
// let currentPlayer;
const Symbols = {
  player1: "X",
  player2: "O",
};

const GameState = {
  ongoing: "ONGOING",
  draw: "DRAW",
};

// generate a unique identifier for the user
const userId = uuidv4();

// store the user ID in a cookie or local storage
localStorage.setItem("userId", userId);

const username = prompt("Please enter your username:");
localStorage.setItem("username", username);

// connect to the WebSocket server with the user ID
const socket = io(config.backendURL, {
  query: { userId: userId, username: username },
});

console.log(config);

// Expose myFunction in the global scope - Makes the function inside the bundled js file accessible to HTML and other js scripts
window.selectedUser = selectedUser;
window.playerMove = playerMove;
// window.sendMessage = sendMessage;

function selectedUser(selectedUserId) {
  console.log("selectedUserId:", selectedUserId);
  // When a user clicks on another user to play with
  socket.emit("selectUser", {
    selectedUserId: selectedUserId,
    meId: localStorage.getItem("userId"),
  });
}

function addUser(client) {
  console.log("client");
  console.log(client.userId);
  let index = 0;
  const { username, engaged } = client;
  const newPlayer = document.createElement("div");
  newPlayer.id = client.userId;
  newPlayer.setAttribute("onclick", "selectedUser(this.id)");
  newPlayer.classList.add("player");
  const h3 = document.createElement("h3");
  const span = document.createElement("span");
  span.innerText = ++index;
  h3.appendChild(span);
  const usernameNode = document.createTextNode(username);
  h3.appendChild(usernameNode);
  const p = document.createElement("p");
  p.classList.add("state");
  const span2 = document.createElement("span");
  span2.classList.add(engaged ? "status-red" : "status");
  const engagedNode = document.createTextNode(
    engaged ? "engaged" : "available"
  );
  p.appendChild(span2);
  p.appendChild(engagedNode);
  newPlayer.appendChild(h3);
  newPlayer.appendChild(p);
  playersOnline.appendChild(newPlayer);
}

const connectHandler = () => {
  console.log(`Socket connected: ${socket.id}`);
  // const username = prompt("Please enter your username:");
  socket.emit("userConnect");
};

const userConnectedHandler = ({ me, clients }) => {
  const meId = localStorage.getItem("userId");
  console.log("me - userConnect");
  console.log(meId);
  console.log("clients - userConnect");
  console.log(clients);

  playersOnline.innerHTML = "";
  // Add the user who just joined to be the top on their list
  addUser(clients[meId]);
  for (const client of Object.values(clients)) {
    console.log(client.userId, me.userId, client.userId === meId);
    if (client.userId !== meId) {
      addUser(client);
    } else {
      // TODO: add a card that shows the me user on top of the all users list
      console.log(client.userId, me.userId, client.userId === meId);
    }
  }
};

function updateUserStatus(id) {
  const selectedUser = document.getElementById(id);
  if (selectedUser) {
    const p = selectedUser.childNodes[1];
    p.innerHTML = "";
    const span2 = document.createElement("span");
    span2.classList.add("status");
    span2.classList.add("status-red");
    const engagedNode = document.createTextNode("engaged");
    p.appendChild(span2);
    p.appendChild(engagedNode);
  }
}

function playerMove(blockId) {
  // send to server the move that has been made
  const userId = setCurrentPlayer.dataset.userId;
  const sender = localStorage.getItem("userId");
  console.log(userId, sender);
  if (userId === sender) socket.emit("playerMove", { sender, blockId });
}

function evaluateGame(board) {
  let vert = [],
    hor = [],
    diagRL = [],
    diagLR = [];
  let blanks = false;
  for (let i = 0; i < gridSize; i++) {
    (hor = []), (vert = []);
    for (let j = 0; j < gridSize; j++) {
      if (board[i][j] === "" && !blanks) blanks = true;
      if (
        board[i][j] !== "" &&
        j + 1 < gridSize &&
        board[i][j] === board[i][j + 1]
      ) {
        // horizontal check
        if (j === 0) hor.push([i, j]);
        hor.push([i, j + 1]);
      }
      // vertical check
      if (
        board[j][i] !== "" &&
        j + 1 < gridSize &&
        board[j][i] === board[j + 1][i]
      ) {
        if (j === 0) vert.push([j, i]);
        vert.push([j + 1, i]);
      }
      // diagonal check
      // diagonal check - left to right
      if (
        i === 0 &&
        board[j][j] !== "" &&
        j + 1 < gridSize &&
        board[j][j] === board[j + 1][j + 1]
      ) {
        if (j === 0) {
          diagLR = [];
          diagLR.push([j, j]);
        }
        diagLR.push([j + 1, j + 1]);
      }
      // diagonal check - right to left
      if (
        i === gridSize - 1 &&
        board[j][i - j] !== "" &&
        j + 1 < gridSize &&
        board[j][i - j] === board[j + 1][i - j - 1]
      ) {
        if (j === 0) {
          diagRL = [];
          diagRL.push([j, i - j]);
        }
        diagRL.push([j + 1, i - j - 1]);
      }
    }
    // console.log(diagRL);
    if (hor.length === gridSize) return hor;
    if (vert.length === gridSize) return vert;
    if (diagLR.length === gridSize) return diagLR;
    if (diagRL.length === gridSize) return diagRL;
  }

  return blanks ? [GameState.ongoing] : [GameState.draw];
}

function gameStart(me, selectedUser) {
  // display game area with tic tac toe and chat box
  const gameArea = document.getElementById("game-play");
  console.log(gameArea);
  gameArea.classList.add("show");
  console.log(gameArea);

  // Update the info to indicate the players. The two battling it out
  const players = document.getElementById("players");
  players.innerHTML = `${me.username} VS ${selectedUser.username}`;

  // activate chat and allow them to communicate✔️

  // select starting player
  socket.emit("currentPlayer", { playerId: me.userId });
}

function gameOver(data, winner) {
  const winnerAnnouncement = document.getElementById("player-switching");
  const overlay = document.getElementById("overlay");
  if (data[0] === GameState.draw) {
    // what to do if users draw
    console.log("DRAW");
    for (let i = 0; i < gridSize * gridSize; i++) {
      let winingBlock = document.getElementById(i);
      winingBlock.style.color = "grey";
      winingBlock.style.fontSize = "7em";
      winnerAnnouncement.innerHTML = `It's a DRAW`;
    }
  } else {
    // what to do if a certain player wins
    console.log(data);
    for (let i = 0; i < data.length; i++) {
      let blockId = data[i][0] * gridSize + data[i][1];
      let winingBlock = document.getElementById(blockId);
      winingBlock.style.color = "brown";
      winingBlock.style.fontSize = "7em";
      winnerAnnouncement.innerHTML = `${winner} WINS`;
    }
  }
  overlay.classList.remove("hide");
}

const form = document.getElementById("send-message-form");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // prevent default form submission behavior

  // do something with the form data
  const sender = localStorage.getItem("userId");
  const message = form.elements["message"].value;
  socket.emit("privateMessage", { sender, message });
});

// Handle the response from the server
const selectUserResponseHandler = (response) => {
  if (response.success) {
    // The user was successfully engaged, handle accordingly
    console.log(response);
    updateUserStatus(response.selectedUser.userId);
    updateUserStatus(response.me.userId);
    gameStart(response.me, response.selectedUser);
  } else {
    // The user was already engaged, display an error message to the user
    // TODO: have some text that appears for a few seconds below the player name and status stating the user is engaged
  }
};

const playerMoveHandler = ({ senderName, senderId, playerNumber, blockId }) => {
  console.log(localStorage.getItem.userId);
  document.getElementById(blockId).innerText =
    playerNumber === 1 ? Symbols.player1 : Symbols.player2;
  blockId = Number(blockId);
  let divider = Math.floor(blockId / gridSize);
  let col = blockId - gridSize * divider;
  let row = Math.floor(blockId / gridSize);
  //   console.log(`row: ${row}, col: ${col}`);

  //   if the spot in array is blank add X or O then scwitch player
  if (BoardArray[row][col] === "") {
    BoardArray[row][col] =
      playerNumber === 1 ? Symbols.player1 : Symbols.player2;

    // Check if the player has won --> end game if player has won
    let gameState = evaluateGame(BoardArray);
    console.log(gameState);
    if (gameState.length === gridSize || gameState[0] === GameState.draw) {
      // TODO: what to do when game is over
      // socket.emit("currentPlayer", { playerId: null });
      gameOver(gameState, senderName);
    } else if (gameState[0] === GameState.ongoing) {
      // TODO: switch player
      let playerId = localStorage.getItem("userId");
      let currentPlayer = setCurrentPlayer.dataset.userId;
      console.log(playerId, currentPlayer, localStorage.getItem("username"));
      if (playerId !== currentPlayer) {
        socket.emit("currentPlayer", { playerId });
      }
    }
  }
};

const currentPlayerHandler = ({ playerId, playerUsername }) => {
  setCurrentPlayer.innerHTML = playerUsername;
  setCurrentPlayer.dataset.userId = playerId;
};

const privateMessageHandler = ({ senderName, senderId, message }) => {
  // console.log(`Message from ${sender}: ${message}`);
  const meId = localStorage.getItem("userId");
  const chatBox = document.getElementById("chat-box");
  const chatItem = document.createElement("div");
  chatItem.classList.add("chat-item");
  senderId !== meId && chatItem.classList.add("other-user");
  const h6 = document.createElement("h6");
  h6.innerText = senderName;
  const p = document.createElement("p");
  p.innerText = message;
  chatItem.appendChild(h6);
  chatItem.appendChild(p);
  chatBox.appendChild(chatItem);
};

const connectedHandler = (data) => {
  console.log(data);
};

const disconnectedHandler = (data) => {
  console.log(`${data.username} (${data.userId}) disconnected`);
};

socket.on("connect", connectHandler);
socket.on("userConnected", userConnectedHandler);
socket.on("selectUserResponse", selectUserResponseHandler);
socket.on("privateMessage", privateMessageHandler);
socket.on("playerMove", playerMoveHandler);
socket.on("currentPlayer", currentPlayerHandler);
socket.on("connected", connectedHandler);
socket.on("disconnected", disconnectedHandler);
