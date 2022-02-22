const dbConn = require("../config/database");
const UsuarioTorneoTFT = require("./Usuario_torneo_TFT.model");
const BitacoraTorneo = require("./Bitacora_torneo.model");
const Torneos = function (torneo) {
  this.nombre = torneo.nombre;
  this.id_juego = torneo.id_juego;
  this.no_equipos = torneo.no_equipos;
  this.no_enfrentamientos = torneo.no_enfrentamientos;
  this.fecha_fin_registro = torneo.fecha_fin_registro;
  this.fecha_inicio = torneo.fecha_inicio;
  this.fecha_creacion = new Date();
  this.premio = torneo.premio;
  this.desc_premio = torneo.desc_premio;
  this.id_estado = 0;
  this.description = torneo.description;
  this.id_etapa_actual = Torneos.calculateEtapaActual(
    torneo.id_juego,
    torneo.no_equipos,
    torneo.no_enfrentamientos
  );
  this.privado = torneo.privado;
  this.codigo_torneo = Torneos.generateCode(torneo.nombre);
};

// calculate etapa actual
Torneos.calculateEtapaActual = function (
  idJuego,
  noEquipos,
  noEnfrentamientos
) {
  if (noEquipos) {
    if (noEquipos === 4) {
      return 1;
    }
    if (noEquipos === 8) {
      return 2;
    }
    if (noEquipos === 16) {
      return 3;
    }
  } else if (noEnfrentamientos) {
    return 5;
  }
};
// generate tournament code
Torneos.generateCode = function (nombreTorneo) {
  return (
    String.fromCharCode(Math.floor(Math.random() * 26) + 97) +
    Math.random().toString(16).slice(2) +
    Date.now().toString(16).slice(4)
  );
};

// CRUD
// create
Torneos.create = function (torneo, idUsuario) {
  return new Promise((resolve, reject) => {
    try {
      torneo = require("../services/checkDate")(torneo);
    } catch (err) {
      return reject(err.toString());
    }
    // Crea el torneo
    dbConn
      .promise()
      .query("INSERT INTO torneos SET ?", torneo)
      .then(([fields, rows]) => {
        // Inserta el torneo en la tabla de usuarios torneos
        const newUsuarioTorneoTFT = new UsuarioTorneoTFT({
          id_torneo: fields.insertId,
          id_usuario: idUsuario,
          posicion: -1,
          is_organizador: true,
        });
        UsuarioTorneoTFT.create(newUsuarioTorneoTFT).catch((err) => {
          reject(err);
        });
        return fields.insertId;
      })
      .then((idTorneo) => {
        // Inserta la creacion en la bitacora
        const newBitacoraTorneo = new BitacoraTorneo({
          id_torneo: idTorneo,
          id_usuario: idUsuario,
          desc_modificacion: "Se creó el torneo: " + torneo.nombre,
        });
        BitacoraTorneo.create(newBitacoraTorneo);
        resolve({ msg: "Se creó el torneo" });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// read
Torneos.getAll = function () {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("SELECT * FROM torneos")
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// update
Torneos.update = function (idTorneo, torneo, oldTorneo, idUsuario) {
  const changesString = require("../services/showTournamentDiff")(
    torneo,
    oldTorneo
  );
  if (changesString.length <= 0) {
    throw new Error("No se han detectado cambios");
  }
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("UPDATE torneos SET ? WHERE id_torneo = ?", [torneo, idTorneo])
      .then(async ([fields, rows]) => {
        // Create a string that contains the changes

        // Inserta la creacion en la bitacora
        const newBitacoraTorneo = new BitacoraTorneo({
          id_torneo: idTorneo,
          id_usuario: idUsuario,
          desc_modificacion:
            "Se modifico el torneo: " +
            oldTorneo.nombre +
            " \nCambios realizados: " +
            changesString,
        });
        let mails;
        // send mail to participants
        if (oldTorneo.id_juego === 1) {
          // LoL
          mails = await Torneos.getInfoEquipos(idTorneo);
        } else if (oldTorneo.id_juego === 2) {
          // TFT
          mails = await UsuarioTorneoTFT.getEmailJugadoresTorneo(idTorneo);
        }
        try {
          if (mails.length > 0) {
            require("../services/sendUpdateTournamentMail")(
              mails,
              oldTorneo.nombre,
              changesString.replace(/\n/g, "<br>")
            );
          }
        } catch (err) {
          reject(new Error("Error al enviar correos").toString());
        }
        await BitacoraTorneo.create(newBitacoraTorneo);
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// delete
Torneos.delete = function (idTorneo) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("DELETE FROM torneos WHERE id_torneo = ?", [idTorneo])
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// get tournaments created by user
Torneos.getTorneosCreados = function (idUsuario) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "select torneos.* from torneos inner join usuario_torneo_TFT on torneos.id_torneo=usuario_torneo_TFT.id_torneo where usuario_torneo_TFT.id_usuario=?",
        [idUsuario]
      )
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

Torneos.getTorneoCreado = function (idTorneo, idUsuario) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        `select torneos.* from torneos 
        inner join usuario_torneo_TFT on torneos.id_torneo=usuario_torneo_TFT.id_torneo 
        where usuario_torneo_TFT.id_torneo=? and usuario_torneo_TFT.id_usuario=?`,
        [idTorneo, idUsuario]
      )
      .then(([fields, rows]) => {
        if (fields.length > 0) {
          resolve(fields[0]);
        } else {
          reject(new Error("No se encontró el torneo").toString());
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};
// get latest created tournament by user
Torneos.getLatestTorneoCreado = function (idUsuario) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "select torneos.* from torneos inner join usuario_torneo_TFT on torneos.id_torneo=usuario_torneo_TFT.id_torneo where usuario_torneo_TFT.id_usuario=? ORDER BY fecha_creacion DESC LIMIT 1",
        [idUsuario]
      )
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// get all not finished tournaments by user
Torneos.getTorneosActivos = function (idUsuario) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "select torneos.* from torneos inner join usuario_torneo_TFT on torneos.id_torneo=usuario_torneo_TFT.id_torneo where usuario_torneo_TFT.id_usuario=? and torneos.id_estado != 5 and torneos.id_estado != 4",
        [idUsuario]
      )
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// Cancel
Torneos.cancel = function (idTorneo, idUsuario, torneo) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "UPDATE torneos SET `id_estado` = '5' WHERE (`id_torneo` = ?);",
        idTorneo
      )
      .then(async ([fields, rows]) => {
        // Inserta la creacion en la bitacora
        const newBitacoraTorneo = new BitacoraTorneo({
          id_torneo: idTorneo,
          id_usuario: idUsuario,
          desc_modificacion: "Se cancelo el torneo: " + torneo.nombre,
        });
        await BitacoraTorneo.create(newBitacoraTorneo);
        let mails;
        // send mail to participants
        if (torneo.id_juego === 1) {
          // LoL
          mails = await Torneos.getInfoEquipos(idTorneo);
        } else if (torneo.id_juego === 2) {
          // TFT
          mails = await UsuarioTorneoTFT.getEmailJugadoresTorneo(idTorneo);
        }
        try {
          if (mails.length > 0) {
            require("../services/sendUpdateTournamentMail")(
              mails,
              torneo.nombre,
              "<b> Se ha cancelado el torneo. </b>"
            );
          }
        } catch (err) {
          reject(new Error("Error al enviar correos").toString());
        }
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

Torneos.getTotalTorneosOrganizador = function (idUsuario) {
  // get number of tournaments created by usuario tft
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "select count(*) as numero from torneos inner join usuario_torneo_TFT on torneos.id_torneo=usuario_torneo_TFT.id_torneo where usuario_torneo_TFT.id_usuario=?",
        [idUsuario]
      )
      .then(([fields, rows]) => {
        resolve(fields[0].numero);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

Torneos.getRangeOfTorneos = function (idUsuario, start, number) {
  // get tournaments created by usuario tft
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "select torneos.* from torneos inner join usuario_torneo_TFT on torneos.id_torneo=usuario_torneo_TFT.id_torneo where usuario_torneo_TFT.id_usuario=? ORDER BY fecha_creacion DESC LIMIT ?, ?",
        [idUsuario, Number(start), Number(number)]
      )
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

Torneos.getInfoEquipos = function (idTorneo) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "select j.email, j.nombre, j.nombre_invocador, j.image, et.posicion, e.nombre as equipo from usuarios as j, usuario_equipo as ue, equipos as e, equipo_torneo as et, torneos as t where t.id_torneo=? and t.id_torneo=et.id_torneo and et.id_equipo=e.id_equipo and e.id_equipo=ue.id_equipo and ue.id_usuario=j.id_usuario;",
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

// list of active tournaments not private
Torneos.getTorneosActivosNoPrivados = function (start, number) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "select nombre, description, fecha_fin_registro, id_juego from torneos where id_estado=0 and privado=0 order by fecha_fin_registro LIMIT ?, ?",
        [Number(start), Number(number)]
      )
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

Torneos.getTotalTorneosActivosNoPrivados = function () {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "select count(*) as numero from torneos where id_estado=0 and privado=0"
      )
      .then(([fields, rows]) => {
        resolve(fields[0].numero);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// get active tournament by name
Torneos.getTorneoByName = function (nombre, start, number) {
  const nameString = "%" + nombre + "%";

  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "select * from torneos where nombre like ? and id_estado=0 and privado=0 ORDER BY fecha_fin_registro LIMIT ?, ?",
        [nameString, Number(start), Number(number)]
      )
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

Torneos.getTotalTorneoByName = function (nombre) {
  const nameString = "%" + nombre + "%";
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query(
        "select count(*) as numero from torneos where nombre like ? and id_estado=0 and privado=0",
        nameString
      )
      .then(([fields, rows]) => {
        resolve(fields[0].numero);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = Torneos;
