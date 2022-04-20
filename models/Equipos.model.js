const dbConn = require("../config/database");
const UsuarioEquipo = require("./Usuario_equipo.model");
const BitacoraEquipo = require("./Bitacora_equipo.model");
const Equipos = function (equipo) {
  this.nombre = equipo.nombre;
  this.logo = equipo.logo;
  this.fecha_creacion = new Date();
  this.codigo_equipo = Equipos.generateCode();
};

Equipos.generateCode = function () {
  return (
    String.fromCharCode(Math.floor(Math.random() * 26) + 97) +
    Math.random().toString(16).slice(2) +
    Date.now().toString(16).slice(4)
  );
};

// crud
Equipos.getNombre = function (idEquipo) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("SELECT nombre FROM equipos WHERE id_equipo = ?", [idEquipo])
      .then(([fields, rows]) => {
        resolve(fields[0]);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// get emails from a team
Equipos.getEmails = function (idEquipo) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "select u.email, u.nombre, e.nombre as nombreEquipo from usuarios as u, usuario_equipo as ue, equipos as e where e.id_equipo=? and e.id_equipo=ue.id_equipo and ue.id_usuario=u.id_usuario;",
        [idEquipo]
      )
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// get mails from teams
Equipos.getEmailsFromTeams = function (idEquipos) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "select u.nombre_invocador, u.email from usuarios as u, usuario_equipo as ue, equipos as e where u.id_usuario=ue.id_usuario and ue.id_equipo=e.id_equipo and e.id_equipo in (?)",
        [idEquipos]
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
Equipos.create = function (equipo, idUsuario) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "INSERT INTO equipos (nombre, logo, fecha_creacion, codigo_equipo) VALUES (?, ?, ?, ?)",
        [
          equipo.nombre,
          equipo.logo,
          equipo.fecha_creacion,
          equipo.codigo_equipo,
        ]
      )
      .then(([fields, rows]) => {
        const usuario = new UsuarioEquipo({
          id_equipo: fields.insertId,
          id_usuario: idUsuario,
          capitan: true,
        });
        UsuarioEquipo.create(usuario);
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// get equipo by code_equipo
Equipos.getByCode = function (code) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("select * from equipos where codigo_equipo=?;", [code])
      .then(([fields, rows]) => {
        resolve(fields[0]);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// update
Equipos.update = function (equipo, idCapitan, oldNombre, oldLogo) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("UPDATE equipos SET nombre=?, logo=? WHERE id_equipo=?", [
        equipo.nombre,
        equipo.logo,
        equipo.id_equipo,
      ])
      .then(async ([fields, rows]) => {
        let descModificacion = "";
        if (oldNombre !== equipo.nombre) {
          descModificacion += `El nombre del equipo ha cambiado de ${oldNombre} a ${equipo.nombre} \n`;
        }
        if (equipo.logo !== oldLogo) {
          descModificacion += `El logo del equipo ha sido cambiado \n`;
        }
        const newBitacoraEquipo = new BitacoraEquipo({
          id_usuario: idCapitan,
          id_equipo: equipo.id_equipo,
          desc_modificacion: descModificacion,
        });
        await BitacoraEquipo.create(newBitacoraEquipo);
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

Equipos.getById = function (idEquipo) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("SELECT * FROM equipos WHERE id_equipo = ?", [idEquipo])
      .then(([fields, rows]) => {
        resolve(fields[0]);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// get nombre, nombre_invocador and image
Equipos.getPlayersInfo = function (idEquipo) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "select u.id_usuario, u.nombre, u.nombre_invocador, u.image, ue.capitan from usuarios as u, usuario_equipo as ue, equipos as e where e.id_equipo=? and e.id_equipo=ue.id_equipo and ue.id_usuario=u.id_usuario;",
        [idEquipo]
      )
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// delete team
Equipos.delete = function (idEquipo) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("DELETE FROM equipos WHERE id_equipo = ?", [idEquipo])
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = Equipos;
