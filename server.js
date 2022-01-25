const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;
// const routes = require("./routes/routes");
const logger = require("morgan");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// CONFIG
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(logger("dev"));

// ROUTES
const routes = require("./routes/routes");
app.use("/api", routes);

// MIDDLEWARE
app.use(express.static(path.join(__dirname, "../client", "build")));
// SERVER
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "build", "index.html"));
});
const errorResponder = (err, req, res, next) => {
  res.header("Content-Type", "application/json");
  res.status(err.status).send(JSON.stringify({ ...err, error: true }, null, 4)); // pretty print
};
app.use(errorResponder);
app.listen(PORT, function () {
  console.log("listening on port: " + PORT);
});
