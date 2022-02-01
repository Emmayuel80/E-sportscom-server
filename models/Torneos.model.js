const dbConn = require("../config/database");
const UsuarioTorneoTFT = require("./Usuario_Torneo_TFT.model");
const BitacoraTorneo = require("./Bitacora_Torneo.model");
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
    // Crea el torneo
    dbConn
      .promise()
      .query("INSERT INTO torneos SET ?", torneo)
      .then(([fields, rows]) => {
        // Inserta el torneo en la tabla de usuarios torneos
        console.log("antes de crear el usuario");
        console.log(fields);
        const newUsuarioTorneoTFT = new UsuarioTorneoTFT({
          id_torneo: fields.insertId,
          id_usuario: idUsuario,
          ganado: false,
        });
        console.log("Se creo el usuario");
        UsuarioTorneoTFT.create(newUsuarioTorneoTFT);
        return fields.insertId;
      })
      .then((idTorneo) => {
        // Inserta la creacion en la bitacora
        console.log(idUsuario);
        const newBitacoraTorneo = new BitacoraTorneo({
          id_torneo: idTorneo,
          id_usuario: idUsuario,
          desc_modificacion: "Se creó el torneo: " + torneo.nombre,
        });
        console.log("Se creo la bitacora");
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
Torneos.update = function (torneo) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("UPDATE torneos SET ? WHERE id_torneo = ?", [
        torneo,
        torneo.id_torneo,
      ])
      .then(([fields, rows]) => {
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
        "select torneos.* from torneos inner join usuario_torneo_TFT on torneos.id_torneo=usuario_torneo_TFT.id_torneo where usuario_torneo_TFT.id_usuario=? and torneos.id_estado != 5 and torneos.id_estado != 7",
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

module.exports = Torneos;
