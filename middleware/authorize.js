const jwt = require("express-jwt");
const { secret } = require("../config/config");
const Usuario = require("../models/Usuario.model.js");
module.exports = authorize;

function authorize(tipo = "general") {
  return [
    // authenticate JWT token and attach decoded token to request as req.user

    jwt({ secret, algorithms: ["HS256"] }),

    // attach full user record to request object
    async (req, res, next) => {
      // get user with id from token 'sub' (subject) property
      Usuario.findById(req.user.sub)
        .then((usuario) => {
          if (tipo === "general") {
            req.usuario = usuario;
            next();
          } else if (usuario[0].tipo === tipo) {
            req.usuario = usuario;
            next();
          } else {
            return res.status(401).send({
              message: "No autorizado",
              error: true,
            });
          }
        })
        .catch((err) => {
          return res.status(500).send({
            message: "Error al buscar el usuario",
            error: err,
          });
        });
    },
  ];
}
