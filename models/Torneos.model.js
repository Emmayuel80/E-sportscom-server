const dbConn = require("../config/database");

const Torneos = function (torneo) {
    this.nombre = torneo.nombre;
    this.juego = torneo.juego;
    this.no_equipos = torneo.no_equipos;
    this.no_enfrentamientos = torneo.no_enfrentamientos;
    this.fecha_fin_registro = torneo.fecha_fin_registro;
    this.fecha_inicio = torneo.fecha_inicio;
    this.fecha_creacion = new Date();
    this.premio = torneo.premio;
    this.desc_premio = torneo.desc_premio;
    this.estado = 0;
    this.etapa_actual = torneo.etapa_actual;
    this.privado = torneo.privado;
    this.codigo_torneo = Torneos.generateCode(torneo.nombre);
}

// generate tournament code
Torneos.generateCode = function (nombreTorneo) {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 97)
    + Math.random().toString(16).slice(2)
    + Date.now().toString(16).slice(4);
}

// CRUD
// create
Torneos.create = function (torneo) {
    return new Promise((resolve, reject) => {
        dbConn
            .promise()
            .query(
                "INSERT INTO torneos SET ?",
                torneo
            )
            .then(([fields, rows]) => {
                resolve({ fields, rows });
            })
            .catch((err) => {
                reject(err);
            });
    });
}

// read
Torneos.getAll = function () {
    return new Promise((resolve, reject) => {
        dbConn
            .promise()
            .query("SELECT * FROM torneos")
            .then(([fields, rows]) => {
                resolve({ fields, rows });
            })
            .catch((err) => {
                reject(err);
            });
    });
}

// update
Torneos.update = function (torneo) {
    return new Promise((resolve, reject) => {
        dbConn
            .promise()
            .query(
                "UPDATE torneos SET ? WHERE id_torneo = ?",
                [torneo, torneo.id_torneo]
            )
            .then(([fields, rows]) => {
                resolve({ fields, rows });
            })
            .catch((err) => {
                reject(err);
            });
    });
}

// delete
Torneos.delete = function (idTorneo) {
    return new Promise((resolve, reject) => {
        dbConn
            .promise()
            .query(
                "DELETE FROM torneos WHERE id_torneo = ?",
                [idTorneo]
            )
            .then(([fields, rows]) => {
                resolve({ fields, rows });
            })
            .catch((err) => {
                reject(err);
            });
    });
}

// get tournaments created by user
Torneos.getTorneosCreados = function (idUsuario) {
    return new Promise((resolve, reject) => {
        dbConn
            .promise()
            .query(
                "SELECT * FROM torneos WHERE id_usuario = ?",
                [idUsuario]
            )
            .then(([fields, rows]) => {
                resolve({ fields, rows });
            })
            .catch((err) => {
                reject(err);
            });
    });
}

// get latest created tournament by user
Torneos.getLatestTorneoCreado = function (idUsuario) {
    return new Promise((resolve, reject) => {
        dbConn
            .promise()
            .query(
                "SELECT * FROM torneos WHERE id_usuario = ? ORDER BY fecha_creacion DESC LIMIT 1",
                [idUsuario]
            )
            .then(([fields, rows]) => {
                resolve({ fields, rows });
            })
            .catch((err) => {
                reject(err);
            });
    });
}

// get all not finished tournaments by user
Torneos.getTorneosActivos = function (idUsuario) {
    return new Promise((resolve, reject) => {
        dbConn
            .promise()
            .query(
                "SELECT * FROM torneos WHERE id_usuario = ? AND estado not equal to 5 and estado not equal to 4",
                [idUsuario]
            )
            .then(([fields, rows]) => {
                resolve({ fields, rows });
            })
            .catch((err) => {
                reject(err);
            });
    });
}



module.exports = Torneos;