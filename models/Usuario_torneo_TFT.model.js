const dbConn = require("../config/database");

const UsuarioTorneoTFT = function (usuario) {
  this.id_usuario = usuario.id_usuario;
  this.id_torneo = usuario.id_torneo;
  this.posicion = usuario.posicion;
  this.is_organizador = usuario.is_organizador;
};

// Crud
UsuarioTorneoTFT.create = (newUsuario) => {
  return new Promise((resolve, reject) => {
    console.log("EL PEPE was here");
    console.log(newUsuario);
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
        u.posicion,
        u.ganado
 FROM   usuarios AS j,
        usuario_torneo_TFT AS u
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

UsuarioTorneoTFT.getEmailJugadoresTorneo = (idTorneo) => {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "select u.email from usuarios as u, usuario_torneo_TFT as ut, torneos as t where t.id_torneo=? and t.id_torneo=ut.id_torneo and ut.id_usuario=u.id_usuario;",
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
module.exports = UsuarioTorneoTFT;
