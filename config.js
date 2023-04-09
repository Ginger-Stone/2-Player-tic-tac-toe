// REMEMBER to run -> browserify client.js -o client-bundle.js <- whenever changes are made to this file

// prod vs dev
const environment = "prod"; //local or dev
const PORT = environment === "local" ? "3000" : "";
const SERVER =
  environment === "local"
    ? "http://127.0.0.1"
    : "https://tictactoeandchat.netlify.app";

// console.log(process.env);
console.log("SERVER: ", SERVER);
// Store configurations to be used on the client side of the application
module.exports = {
  backendURL: PORT !== "" ? `${SERVER}:${PORT}` : SERVER,
};
