// REMEMBER to run -> browserify client.js -o client-bundle.js <- whenever changes are made to this file

const io = require("socket.io-client");

const socket = io("http://127.0.0.1:3000");
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
  const username = prompt("Please enter your username:");

  // Emit the 'connect' event with the username
  socket.emit("userConnect", { username: username });
});

// Handle the 'userConnect' event from the server
socket.on("userConnected", (clients) => {
  console.log("clients - userConnect");
  console.log(clients);
  let playersOnline = document.getElementById("players-online");
  playersOnline.innerHTML = "";
  let index = 0;
  for (let client in clients) {
    console.log("client");
    console.log(clients[client]?.userId);
    client = clients[client];
    let newPlayer = document.createElement("div");
    newPlayer.id = client.userId;
    newPlayer.classList.add("player");
    // add client name and id
    let h3 = document.createElement("h3");
    let span = document.createElement("span");
    span.innerText = ++index;
    h3.appendChild(span);
    let username = document.createTextNode(client.username);
    h3.appendChild(username);
    // add client status
    let p = document.createElement("p");
    p.classList.add("state");
    let span2 = document.createElement("span2");
    span2.classList.add("status");
    let engaged = document.createTextNode(
      client.engaged ? "engaged" : "available"
    );
    p.appendChild(span2);
    p.appendChild(engaged);
    newPlayer.appendChild(h3);
    newPlayer.appendChild(p);
    playersOnline.appendChild(newPlayer);
  }
});

// Handle the 'connected' event from the server
socket.on("connected", (data) => {
  console.log(data);
});

// Handle the 'disconnected' event from the server
socket.on("disconnected", (data) => {
  console.log(`${data.username} (${data.userId}) disconnected`);
});
