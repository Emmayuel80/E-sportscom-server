const dbConn = require("../config/database");
const BitacoraTorneo = require("./Bitacora_torneo.model");
const Equipos = require("./Equipos.model");
const EquipoTorneo = function (equipo) {
  this.id_equipo = equipo.id_equipo;
  this.id_torneo = equipo.id_torneo;
  this.estado = equipo.estado;
  this.no_equipo = equipo.no_equipo;
  this.posicion = equipo.posicion;
};

// kick equipo torneo
EquipoTorneo.kickEquipo = (idTorneo, idUsuario, idEquipo, torneo) => {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "DELETE FROM equipo_torneo WHERE id_torneo = ? AND id_equipo = ?",
        [idTorneo, idEquipo]
      )
      .then(async (res) => {
        if (res[0].affectedRows === 0) {
          reject(new Error("No se realizaron cambios").toString());
          return;
        }
        const nombreEquipo = await Equipos.getNombre(idEquipo);
        const newBitacoraTorneo = new BitacoraTorneo({
          id_torneo: idTorneo,
          id_usuario: idUsuario,
          desc_modificacion: "Se expulso al equipo: " + nombreEquipo,
        });
        await BitacoraTorneo.create(newBitacoraTorneo);
        try {
          require("../services/sendUpdateTournamentMail")(
            torneo,
            torneo.nombre,
            `<b> Has sido expulsado del torneo ${torneo.nombre} </b>`
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

// create
EquipoTorneo.create = (equipo) => {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("INSERT INTO equipo_torneo SET ?", equipo)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// get count of teams in a tournament
EquipoTorneo.getTotalEquipos = (idequipo) => {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "select count(*) as total from new_esportscom.equipo_torneo where id_torneo=?",
        idequipo
      )
      .then(([fields, rows]) => {
        resolve(fields[0]);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = EquipoTorneo;
