// require("dotenv").config({ debug: true });

const PORT = "3000";
const SERVER = "http://127.0.0.1";

// console.log(process.env);
// console.log("PORT: ", PORT);
// Store configurations to be used on the client side of the application
module.exports = {
  backendURL: PORT !== "" ? `${SERVER}:${PORT}` : SERVER,
};
