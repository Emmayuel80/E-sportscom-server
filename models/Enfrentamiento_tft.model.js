const dbConn = require("../config/database");
const EnfrentamientoTft = function () {};

// find by id
EnfrentamientoTft.findById = function (id) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "SELECT * FROM enfrentamiento_tft WHERE idenfrentamiento_TFT = ?",
        id
      )
      .then(([fields, rows]) => {
        fields[0].json_data = JSON.parse(fields[0].json_data);
        resolve(fields[0]);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// update
EnfrentamientoTft.update = function (id, data) {
  return new Promise((resolve, reject) => {
    data.json_data = JSON.stringify(data.json_data);
    dbConn
      .promise()
      .query("UPDATE enfrentamiento_tft SET ? WHERE idenfrentamiento_TFT = ?", [
        data,
        id,
      ])
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

EnfrentamientoTft.getEnfrentamientosSinJugar = function (idTorneo) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "select * from enfrentamiento_tft where id_torneo=? and fecha_jugada is null;",
        idTorneo
      )
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = EnfrentamientoTft;
