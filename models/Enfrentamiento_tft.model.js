const dbConn = require("../config/database");
const BitacoraTorneo = require("./Bitacora_torneo.model");
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
EnfrentamientoTft.update = function (id, data, torneo) {
  return new Promise((resolve, reject) => {
    data.json_data = JSON.stringify(data.json_data);
    dbConn
      .promise()
      .query("UPDATE enfrentamiento_tft SET ? WHERE idenfrentamiento_TFT = ?", [
        data,
        id,
      ])
      .then(([fields, rows]) => {
        // Inserta la creacion en la bitacora
        const newBitacoraTorneo = new BitacoraTorneo({
          id_torneo: torneo.id_torneo,
          id_usuario: torneo.id_usuario,
          desc_modificacion: `Se jugó el enfrentamiento ${id} del torneo ${torneo.nombre} con ID ${torneo.id_torneo}.`,
        });
        BitacoraTorneo.create(newBitacoraTorneo);
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

EnfrentamientoTft.getEnfrentamientosFromTorneo = function (idTorneo) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("select * from enfrentamiento_tft where id_torneo=?;", idTorneo)
      .then(([fields, rows]) => {
        const parsedFields = fields.map((enfrentamiento) => {
          enfrentamiento.json_resultado = JSON.parse(
            enfrentamiento.json_resultado || "{}"
          );
          enfrentamiento.json_data = JSON.parse(
            enfrentamiento.json_data || "{}"
          );
          return enfrentamiento;
        });
        // sort by placement
        for (const enfrentamiento of parsedFields) {
          if (enfrentamiento.json_resultado.info) {
            enfrentamiento.json_resultado.info.participants.sort((a, b) => {
              return a.placement - b.placement;
            });
          }
        }
        resolve(parsedFields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = EnfrentamientoTft;
