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

PartidaLol.getPartidaByTeam = function (idEquipo, idTorneo) {
  return new Promise(function (resolve, reject) {
    dbConn
      .promise()
      .query(
        "SELECT * FROM partida_lol WHERE (id_equipo1 = ? OR id_equipo2 = ?) AND id_ganador IS NULL AND id_torneo=?",
        [idEquipo, idEquipo, idTorneo]
      )
      .then(function ([fields, rows]) {
        resolve(fields[0]);
      })
      .catch(function (err) {
        reject(err);
      });
  });
};

PartidaLol.setWinner = function (idPartida, idGanador) {
  return new Promise(function (resolve, reject) {
    dbConn
      .promise()
      .query("UPDATE partida_lol SET id_ganador = ? WHERE id_partida = ?", [
        idGanador,
        idPartida,
      ])
      .then(function ([fields, rows]) {
        resolve(fields);
      })
      .catch(function (err) {
        reject(err);
      });
  });
};

PartidaLol.getPartidaById = function (idPartida) {
  return new Promise(function (resolve, reject) {
    dbConn
      .promise()
      .query("SELECT * FROM partida_lol WHERE id_partida = ?", [idPartida])
      .then(function ([fields, rows]) {
        resolve(fields[0]);
      })
      .catch(function (err) {
        reject(err);
      });
  });
};

PartidaLol.getPartidasByTorneo = function (idTorneo) {
  return new Promise(function (resolve, reject) {
    dbConn
      .promise()
      .query(
        "SELECT p.*, e1.nombre as equipo1, e1.logo as logo1, e2.nombre as equipo2, e2.logo as logo2 FROM partida_lol as p, equipos as e1, equipos as e2 where p.id_torneo=? and e1.id_equipo=p.id_equipo1 and e2.id_equipo=p.id_equipo2",
        [idTorneo]
      )
      .then(function ([fields, rows]) {
        resolve(fields);
      })
      .catch(function (err) {
        reject(err);
      });
  });
};

module.exports = PartidaLol;
