const dbConn = require("../config/database");
const BitacoraEquipo = function (bitacora) {
  this.id_equipo = bitacora.id_equipo;
  this.id_usuario = bitacora.id_usuario;
  this.fecha_modificacion = new Date();
  this.desc_modificacion = bitacora.desc_modificacion;
};

// create
BitacoraEquipo.create = function (bitacora) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("INSERT INTO bitacora_equipo SET ?", bitacora)
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

BitacoraEquipo.getAllFromEquipo = function (idEquipo) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "SELECT * FROM bitacora_equipo WHERE id_equipo = ? ORDER BY id_bitacora_equipo DESC",
        idEquipo
      )
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = BitacoraEquipo;
