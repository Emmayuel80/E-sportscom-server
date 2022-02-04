const dbConn = require("../config/database");

const UsuarioTorneoTFT = function (usuario) {
  this.id_usuario = usuario.id_usuario;
  this.id_torneo = usuario.id_torneo;
  this.ganado = usuario.ganado;
  this.is_organizador = usuario.is_organizador;
};

// Crud
UsuarioTorneoTFT.create = (newUsuario, result) => {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("INSERT INTO usuario_torneo_TFT SET ?", newUsuario)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

UsuarioTorneoTFT.getJugadoresTorneo = (idTorneo) => {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        `SELECT j.id_usuario,
        j.nombre,
        u.puntaje_jugador,
        u.no_enfrentamientos_jugados,
        u.total_damage,
        u.posicion
 FROM   usuarios AS j,
        usuario_torneo_tft AS u
 WHERE  j.id_usuario = u.id_usuario
        AND u.id_torneo = ?
        AND u.is_organizador = 0;`,
        idTorneo
      )
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
module.exports = UsuarioTorneoTFT;
