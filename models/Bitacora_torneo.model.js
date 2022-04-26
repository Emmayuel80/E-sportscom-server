const dbConn = require("../config/database");
const BitacoraTorneo = function (bitacora) {
  this.id_torneo = bitacora.id_torneo;
  this.id_usuario = bitacora.id_usuario;
  this.fecha_modificacion = new Date();
  this.desc_modificacion = bitacora.desc_modificacion;
};

BitacoraTorneo.getLatestActivity = function (idUsuario) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "SELECT * FROM bitacora_torneo WHERE id_usuario = ? ORDER BY fecha_modificacion DESC LIMIT 5",
        [idUsuario]
      )
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// create
BitacoraTorneo.create = function (bitacora) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("INSERT INTO bitacora_torneo SET ?", bitacora)
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// read
BitacoraTorneo.getAll = function () {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("SELECT * FROM bitacora_torneo")
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
// update
BitacoraTorneo.update = function (bitacora) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("UPDATE bitacora_torneo SET ? WHERE id_torneo = ?", [
        bitacora,
        bitacora.id_torneo,
      ])
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// delete
BitacoraTorneo.delete = function (id) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("DELETE FROM bitacora_torneo WHERE id_torneo = ?", [id])
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

BitacoraTorneo.getByIdTorneo = function (id) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "SELECT * FROM bitacora_torneo WHERE id_torneo = ? ORDER BY fecha_modificacion ASC",
        [id]
      )
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = BitacoraTorneo;
