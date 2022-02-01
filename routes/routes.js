const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario.model.js");
const authorize = require("../middleware/authorize.js");
const { secret } = require("../config/config.js");
const jwt = require("jsonwebtoken");
router.post("/register", (req, res) => {
  const newUsuario = new Usuario(req.body);
  // handles null error
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res
      .status(400)
      .send({ error: true, message: "Please provide all required field" });
  } else {
    Usuario.create(newUsuario)
      .then((usuario) => {
        res.json({ error: false, message: "Usuario añadido!", data: usuario });
      })
      .catch((err) => {
        res.status(500).send({ error: err, message: "Error al crear usuario" });
      });
  }
});

router.post("/login", (req, res) => {
  Usuario.authenticate(req.body)
    .then((usuario) => {
      res.json({
        error: false,
        message: "Usuario autenticado!",
        data: usuario,
      });
    })
    .catch((err) => {
      res.status(400).send({ error: err });
    });
});

router.post("/forgotPassword", (req, res) => {
  const { email } = req.body;
  // make sure email exists in database
  Usuario.findByEmail(email)
    .then((usuario) => {
      if (!usuario)
        res.status(404).send({ error: true, message: "No existe el usuario." });
      else {
        // generate link
        const JWTSecret = secret + usuario[0].password;
        const payload = {
          email: usuario[0].email,
          id: usuario[0].id_usuario,
        };
        const token = jwt.sign(payload, JWTSecret, { expiresIn: "1h" });
        const link = `https://pwa-esports.herokuapp.com/resetPassword/${usuario[0].id_usuario}/${token}`;
        // send email with link
        try {
          require("../services/sendPasswordLink.js")(
            usuario[0].email,
            link,
            usuario[0].nombre
          );
          res.json({
            error: false,
            message: "Email enviado!",
          });
        } catch (error) {
          res.status(400).send(error);
        }
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.get("/resetPassword/:id/:token", (req, res) => {
  const { id, token } = req.params;
  // verify if user exists
  Usuario.findById(id)
    .then((usuario) => {
      if (!usuario)
        res.status(404).send({ error: true, message: "No existe el usuario." });
      else {
        // verify if token is valid
        const JWTSecret = secret + usuario[0].password;
        const payload = jwt.verify(token, JWTSecret);
        if (payload.id === usuario[0].id_usuario) {
          res.json({
            error: false,
            message: "Token valido!",
            data: usuario,
          });
        } else {
          res.status(400).send({ error: true, message: "Token invalido." });
        }
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.post("/resetPassword/:id/:token", (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  // verify if user exists
  Usuario.findById(id)
    .then((usuario) => {
      if (!usuario)
        res.status(404).send({ error: true, message: "No existe el usuario." });
      else {
        // verify if token is valid
        const JWTSecret = secret + usuario[0].password;
        try {
          const payload = jwt.verify(token, JWTSecret);
          if (payload.id === usuario[0].id_usuario) {
            // update password
            Usuario.updatePassword(id, password)
              .then((msg) => {
                res.json({
                  error: false,
                  message: msg,
                });
              })
              .catch((err) => {
                res.status(400).send(err);
              });
          } else {
            res.status(400).send({ error: true, message: "Token invalido." });
          }
        } catch (error) {
          res.status(400).send({ error: true, message: "Token invalido." });
        }
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.put("/editProfile", authorize(), (req, res) => {
  Usuario.updateProfile(req.user.sub, req.body)
    .then((result) => {
      Usuario.findById(req.user.sub)
        .then((usuario) => {
          res.json({
            error: false,
            message: "Usuario actualizado!",
            data: usuario,
          });
        })
        .catch((err) => {
          res.status(400).send(err);
        });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.put("/updatePassword", authorize(), (req, res) => {
  Usuario.updatePassword(req.user.sub, req.body.password)
    .then((result) => {
      Usuario.findById(req.user.sub)
        .then((usuario) => {
          res.json({
            error: false,
            message: "Password actualizado!",
            data: usuario,
          });
        })
        .catch((err) => {
          res.status(400).send(err);
        });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.post("/jugador/verifyToken", authorize("jugador"), (req, res) => {
  res.json({
    error: false,
    message: "Token valido!",
  });
});
router.post(
  "/organizador/verifyToken",
  authorize("organizador"),
  (req, res) => {
    res.json({
      error: false,
      message: "Token valido!",
    });
  }
);

router.post("/verifyEmail/:id/:token", (req, res) => {
  const { id, token } = req.params;
  // verify if user exists
  Usuario.findById(id)
    .then((usuario) => {
      if (!usuario)
        res.status(404).send({ error: true, message: "No existe el usuario." });
      else {
        // verify if token is valid
        const JWTSecret = secret + (usuario[0].is_active ? "1" : "0");
        const payload = jwt.verify(token, JWTSecret);
        if (payload.id === usuario[0].id_usuario) {
          return Usuario.updateIsActive(id, true);
        } else {
          res.status(400).send({ error: true, message: "Token invalido." });
        }
      }
    })
    .then((result) => {
      res.json({
        error: false,
        message: "Email verificado!",
      });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});
module.exports = router;
