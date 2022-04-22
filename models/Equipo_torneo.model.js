const dbConn = require("../config/database");
const BitacoraTorneo = require("./Bitacora_torneo.model");
const Equipos = require("./Equipos.model");
const EquipoTorneo = function (equipo) {
  this.id_equipo = equipo.id_equipo;
  this.id_torneo = equipo.id_torneo;
  this.estado = equipo.estado;
  this.no_equipo = equipo.no_equipo;
  this.ganador = false;
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
        "select count(*) as total from equipo_torneo where id_torneo=?",
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

EquipoTorneo.getTorneosGanados = (idUsuario) => {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        `select count(*) as total from usuarios as u, usuario_equipo as ue, equipos as e, equipo_torneo as et, torneos as t 
      where u.id_usuario=? and u.id_usuario=ue.id_usuario and ue.id_equipo=e.id_equipo and e.id_equipo=et.id_equipo and et.id_torneo=t.id_torneo and et.ganado=1 and t.id_estado=3;`,
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

EquipoTorneo.getTorneosParticipados = (idUsuario) => {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        `select count(*) as total from usuarios as u, usuario_equipo as ue, equipos as e, equipo_torneo as et, torneos as t 
      where u.id_usuario=? and u.id_usuario=ue.id_usuario and ue.id_equipo=e.id_equipo and e.id_equipo=et.id_equipo and et.id_torneo=t.id_torneo;`,
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

// get remaining teams in a tournament
EquipoTorneo.getEquiposNoEliminados = (idequipo) => {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "select * from equipo_torneo where id_torneo=? and estado=1 order by no_equipo;",
        idequipo
      )
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

EquipoTorneo.setLoser = (idTorneo, idEquipo) => {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "UPDATE equipo_torneo SET estado=0 WHERE id_torneo=? AND id_equipo=?",
        [idTorneo, idEquipo]
      )
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

EquipoTorneo.setGanadorTorneo = (idTorneo, idEquipo) => {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "UPDATE equipo_torneo SET ganador=1 WHERE id_torneo=? AND id_equipo=?",
        [idTorneo, idEquipo]
      )
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
module.exports = EquipoTorneo;
