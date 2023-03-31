// require("dotenv").config({ debug: true });

// prod
const environment = "local"; //local or dev
// dev
const PORT = environment === "local" ? "3000" : "";
const SERVER =
  environment === "local"
    ? "http://127.0.0.1"
    : "https://tictactoed.netlify.app";

// console.log(process.env);
// console.log("PORT: ", PORT);
// Store configurations to be used on the client side of the application
module.exports = {
  backendURL: PORT !== "" ? `${SERVER}:${PORT}` : SERVER,
};
