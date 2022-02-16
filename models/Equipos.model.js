const dbConn = require("../config/database");
const Equipos = function (equipo) {
  this.nombre = equipo.nombre;
  this.logo = equipo.logo;
  this.fecha_creacion = equipo.fecha_creacion;
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
        "select u.email, u.nombre from usuarios as u, usuario_equipo as ue, equipos as e where e.id_equipo=? and e.id_equipo=ue.id_equipo and ue.id_usuario=u.id_usuario;",
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
