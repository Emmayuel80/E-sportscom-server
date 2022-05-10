const express = require("express");
const http = require("http");

const app = express();
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

// STARTUP TASKS
require("./daemons/startup")();
require("./daemons/checkFechaInicioTorneo")();

// DAEMON SCHEDULING
const cron = require("node-cron");
cron.schedule("0 4 * * *", () => {
  require("./daemons/startup")();
});

cron.schedule("0 * * * *", () => {
  require("./daemons/checkFechaInicioTorneo")();
});

// ROUTES
const routes = require("./routes/routes");
app.use("/api", routes);
const organizador = require("./routes/organizadorRoutes");
app.use("/api/organizador", organizador);
const jugador = require("./routes/jugadorRoutes");
app.use("/api/jugador", jugador);

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
const httpServer = http.createServer(app);

httpServer.listen(8080);
