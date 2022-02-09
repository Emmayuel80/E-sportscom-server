const dbConn = require("../config/database");
const bcrypt = require("bcrypt");
const saltRounds = 5;
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const leagueJS = require("../config/riotApi");
// Usuario object create
const Usuario = function (usuario) {
  this.nombre = usuario.username;
  this.email = usuario.email;
  this.password = usuario.password;
  this.tipo = usuario.type;
  this.fecha_registro = new Date();
  this.is_active = false;
};

Usuario.create = async function (newUsuario) {
  return new Promise((resolve, reject) => {
    bcrypt
      .hash(newUsuario.password, saltRounds)
      .then((hash) => {
        newUsuario.password = hash;
        return dbConn
          .promise()
          .query("SELECT * FROM usuarios WHERE email = ?", newUsuario.email);
      })
      .then(([fields, rows]) => {
        if (fields.length >= 1) {
          reject(new Error("El correo ya esta registrado").toString());
        } else {
          return dbConn
            .promise()
            .query("INSERT INTO usuarios set ?", newUsuario);
        }
      })
      .then(([fields, rows]) => {
        // usuario registrado
        // generate link
        const JWTSecret =
          process.env.JWT_SECRET + (newUsuario.is_active ? "1" : "0");
        const payload = {
          email: newUsuario.email,
          id: fields.insertId,
        };
        const token = jwt.sign(payload, JWTSecret, { expiresIn: "7d" });
        const link = `https://pwa-esports.herokuapp.com/verifyEmail/${fields.insertId}/${token}`;
        // send email with link
        require("../services/sendEmailLink.js")(
          newUsuario.email,
          link,
          newUsuario.nombre
        );
        resolve({ message: "Usuario registrado", usuario: fields });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

Usuario.findByEmail = function (email) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("SELECT * FROM usuarios WHERE email = ?", email)
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// Metodo para encontrar un usuario por id_usuario
Usuario.findById = function (id) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("SELECT * FROM usuarios WHERE id_usuario = ?", id)
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

Usuario.findAll = function () {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("SELECT * FROM usuarios")
      .then(([fields, rows]) => {
        resolve(fields);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// Permite editar el perfil del usuario (jugador o organizador)
Usuario.updateProfile = function (id, request) {
  return new Promise((resolve, reject) => {
    leagueJS.Summoner.gettingByName(request.nombre_invocador)
      .then((summoner) => {
        request.image = `https://cdn.communitydragon.org/12.3.1/profile-icon/${summoner.profileIconId}`;
        return dbConn
          .promise()
          .query(
            "UPDATE usuarios set nombre = ?, nombre_invocador=?, image=? WHERE id_usuario=?",
            [request.nombre, request.nombre_invocador, request.image, id]
          );
      })
      .then(([fields, rows]) => {
        resolve({ message: "Perfil actualizado", fields });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

Usuario.authenticate = function ({ email, password }) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("SELECT * FROM usuarios WHERE email = ?", email)
      .then(([fields, rows]) => {
        if (fields.length < 1) {
          reject(new Error("Correo no encontrado.").toString());
        } else {
          bcrypt
            .compare(password, fields[0].password)
            .then((check) => {
              if (check) {
                if (fields[0].is_active) {
                  const token = jwt.sign(
                    { sub: fields[0].id_usuario, password: fields[0].password },
                    config.secret,
                    {
                      expiresIn: "7d",
                    }
                  );
                  resolve({ ...fields[0], token });
                } else {
                  reject(new Error("El usuario no esta activado.").toString());
                }
              } else {
                reject(new Error("Contraseña incorrecta.").toString());
              }
            })
            .catch((err) => {
              reject(err);
            });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

Usuario.updatePassword = function (id, password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds).then((hash) => {
      dbConn
        .promise()
        .query("UPDATE usuarios set password = ? WHERE id_usuario=?", [
          hash,
          id,
        ])
        .then(([fields, rows]) => {
          resolve({ message: "Contraseña actualizada", usuario: fields });
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};

Usuario.updateIsActive = function (id, isActive) {
  return new Promise((resolve, reject) => {
    dbConn
      .promise()
      .query("UPDATE usuarios set is_active = ? WHERE id_usuario=?", [
        isActive,
        id,
      ])
      .then(([fields, rows]) => {
        resolve({ message: "Estado actualizado", usuario: fields });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// Permite actualizar la foto de perfil del usuario (jugador o organizador)
Usuario.updateProfileImage = function (nombreInvocador, idUsuario) {
  return new Promise((resolve, reject) => {
    leagueJS.Summoner.gettingByName(nombreInvocador)
      .then((summoner) => {
        const image = `https://cdn.communitydragon.org/12.3.1/profile-icon/${summoner.profileIconId}`;
        return dbConn
          .promise()
          .query("UPDATE usuarios set image=? WHERE id_usuario=?", [
            image,
            idUsuario,
          ]);
      })
      .then(([fields, rows]) => {
        resolve({ message: "Foto de Perfil actualizada", fields });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = Usuario;
