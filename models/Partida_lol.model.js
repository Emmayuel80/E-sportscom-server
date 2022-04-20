const dbConn = require("../config/database");
const PartidaLol = function (partida) {
  this.id_equipo1 = partida.id_equipo1;
  this.id_equipo2 = partida.id_equipo2;
  this.id_torneo = partida.id_torneo;
  this.etapa = partida.etapa;
  this.fecha_jugada = new Date();
  this.id_capitan = this.id_equipo1;
};

// create
PartidaLol.create = function (partida) {
  return new Promise(function (resolve, reject) {
    dbConn
      .promise()
      .query("INSERT INTO partida_lol SET ?", partida)
      .then(function ([fields, rows]) {
        resolve(fields);
      })
      .catch(function (err) {
        reject(err);
      });
  });
};

module.exports = PartidaLol;
