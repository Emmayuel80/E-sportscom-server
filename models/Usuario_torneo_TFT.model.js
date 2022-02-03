const dbConn = require("../config/database");

const UsuarioTorneoTFT = function (usuario) {
  this.id_usuario = usuario.id_usuario;
  this.id_torneo = usuario.id_torneo;
  this.ganado = usuario.ganado;
  this.is_organizador = usuario.is_organizador;
};

// Crud
UsuarioTorneoTFT.create = (newUsuario, result) => {
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

module.exports = UsuarioTorneoTFT;
