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
EquipoTorneo.kickEquipo = (idTorneo, idUsuario, idEquipo, nombreTorneo) => {
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
        // send mail to participants
        // LoL
        const mails = await Equipos.getEmails(idTorneo);
        try {
          require("../services/sendUpdateTournamentMail")(
            mails,
            nombreTorneo,
            `<b> Has sido expulsado del torneo ${nombreTorneo} </b>`
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
