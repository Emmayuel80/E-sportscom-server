const dbConn = require("../config/database");
const Usuario = require("../models/Usuario.model.js");
const BitacoraTorneo = require("./Bitacora_torneo.model");
const UsuarioTorneoTFT = function (usuario) {
  this.id_usuario = usuario.id_usuario;
  this.id_torneo = usuario.id_torneo;
  this.posicion = usuario.posicion;
  this.is_organizador = usuario.is_organizador;
};

// Crud
UsuarioTorneoTFT.create = (newUsuario) => {
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
        j.image,
        u.puntaje_jugador,
        u.no_enfrentamientos_jugados,
        u.total_damage,
        u.posicion
 FROM   usuarios AS j,
        usuario_torneo_TFT AS u
 WHERE  j.id_usuario = u.id_usuario
        AND u.id_torneo = ?
        AND u.is_organizador = 0;`,
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

UsuarioTorneoTFT.getJugadorTorneo = (idTorneo, idUsuario) => {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        `SELECT j.id_usuario,
        j.nombre,
        j.image,
        u.puntaje_jugador,
        u.no_enfrentamientos_jugados,
        u.total_damage,
        u.posicion
 FROM   usuarios AS j,
        usuario_torneo_TFT AS u
 WHERE  j.id_usuario = u.id_usuario
        AND u.id_torneo = ?
        AND u.id_usuario = ?
        AND u.is_organizador = 0;`,
        [idTorneo, idUsuario]
      )
      .then(([fields, rows]) => {
        resolve(fields);
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

// kick participante
UsuarioTorneoTFT.kickParticipante = (
  idTorneo,
  idOrganizador,
  idUsuario,
  torneo
) => {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "DELETE FROM usuario_torneo_TFT WHERE id_torneo = ? AND id_usuario = ? AND is_organizador = 0;",
        [idTorneo, idUsuario]
      )
      .then(async (res) => {
        if (res[0].affectedRows === 0) {
          reject(new Error("No se realizaron cambios").toString());
          return;
        }
        const usuario = await Usuario.findById(idUsuario);
        const newBitacoraTorneo = new BitacoraTorneo({
          id_torneo: idTorneo,
          id_usuario: idOrganizador,
          desc_modificacion: "Se expulso al jugador: " + usuario[0].nombre,
        });
        await BitacoraTorneo.create(newBitacoraTorneo);
        // send mail to participants
        try {
          await require("../services/sendUpdateTournamentMail")(
            torneo,
            torneo.nombre,
            `<b> Has sido expulsado del torneo ${torneo.nombre} </b>`,
            usuario[0]
          );
        } catch (err) {
          reject(new Error("Error al enviar correos").toString());
        }
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
module.exports = UsuarioTorneoTFT;
