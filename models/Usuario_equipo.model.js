const dbConn = require("../config/database");
const BitacoraEquipo = require("./Bitacora_equipo.model");
const Usuario = require("./Usuario.model");
const UsuarioEquipo = function (usuario) {
  this.id_equipo = usuario.id_equipo;
  this.id_usuario = usuario.id_usuario;
  this.capitan = usuario.capitan;
};

// create
UsuarioEquipo.create = function (usuario) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "INSERT INTO usuario_equipo (id_usuario, id_equipo, capitan) VALUES (?, ?, ?)",
        [usuario.id_usuario, usuario.id_equipo, usuario.capitan]
      )
      .then(async ([fields, rows]) => {
        const user = await Usuario.findById(usuario.id_usuario);
        return user;
      })
      .then(async (user) => {
        const capitan = await UsuarioEquipo.getCapitanEquipo(usuario.id_equipo);
        const newBitacoraEquipo = new BitacoraEquipo({
          id_usuario: capitan.id_usuario,
          id_equipo: usuario.id_equipo,
          desc_modificacion: `El jugador ${user[0].nombre} se ha unido al equipo`,
        });
        await BitacoraEquipo.create(newBitacoraEquipo);
        resolve({ msg: "UsuarioEquipo creado" });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

UsuarioEquipo.getEquipoJugador = function (idUsuario, idEquipo) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "SELECT * FROM usuario_equipo WHERE id_usuario = ? and id_equipo = ?",
        [idUsuario, idEquipo]
      )
      .then(([fields, rows]) => {
        resolve(fields[0]);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

UsuarioEquipo.getTotalEquiposJugador = function (idUsuario) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "SELECT COUNT(*) AS total FROM usuario_equipo WHERE id_usuario = ?",
        [idUsuario]
      )
      .then(([fields, rows]) => {
        resolve(fields[0].total);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

UsuarioEquipo.getTotalJugadoresEquipo = function (idEquipo) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "SELECT COUNT(*) AS total FROM usuario_equipo WHERE id_equipo = ?",
        [idEquipo]
      )
      .then(([fields, rows]) => {
        resolve(fields[0].total);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

UsuarioEquipo.getCapitanEquipo = function (idEquipo) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "SELECT * FROM usuario_equipo WHERE id_equipo = ? AND capitan = 1",
        [idEquipo]
      )
      .then(([fields, rows]) => {
        resolve(fields[0]);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// delete player from team
UsuarioEquipo.delete = function (idUsuario, idEquipo, nombreEquipo) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "DELETE FROM usuario_equipo WHERE id_usuario = ? AND id_equipo = ? AND capitan = 0",
        [idUsuario, idEquipo]
      )
      .then(async ([fields, rows]) => {
        // add to bitacora
        const capitan = await UsuarioEquipo.getCapitanEquipo(idEquipo);
        const usuario = await Usuario.findById(idUsuario);
        const newBitacoraEquipo = new BitacoraEquipo({
          id_usuario: capitan.id_usuario,
          id_equipo: idEquipo,
          desc_modificacion: `El jugador ${usuario[0].nombre} ha sido expulsado del equipo`,
        });
        await BitacoraEquipo.create(newBitacoraEquipo);
        require("../services/sendUpdateJugadorMail")(
          usuario[0].email,
          usuario[0].nombre,
          `el equipo ${nombreEquipo.nombre}`,
          `<b>Has sido explusado del equipo</b>`
        );
        resolve({ msg: "UsuarioEquipo eliminado" });
      })
      .catch((err) => {
        reject(err);
      });
  });
};
module.exports = UsuarioEquipo;
