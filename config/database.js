// Conexion a la base de datos
const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});
connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected to database!");
});

module.exports = connection;
