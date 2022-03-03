const fs = require("fs");
const handlebars = require("handlebars");
const transporter = require("../config/mailer");
const Torneos = require("../models/Torneos.model");
const UsuarioTorneoTFT = require("../models/Usuario_torneo_TFT.model");
module.exports = async function sendUpdateTournamentMail(
  torneo,
  nombreTorneo,
  changes,
  mail = false
) {
  let mails;
  if (mail) {
    mails = [mail];
  } else {
    // send mail to participants
    if (torneo.id_juego === 1) {
      // LoL
      mails = await Torneos.getInfoEquipos(torneo.id_torneo);
    } else if (torneo.id_juego === 2) {
      // TFT
      mails = await UsuarioTorneoTFT.getEmailJugadoresTorneo(torneo.id_torneo);
    }
  }
  try {
    if (mails.length > 0) {
      const mailArray = mails.map((mail) => {
        return mail.email;
      });
      fs.readFile(
        "./templates/updateTournamentTemplate.html",
        "utf8",
        function (err, data) {
          if (err) throw err;
          const source = data.toString();
          const template = handlebars.compile(source);
          const context = {
            nombreTorneo: nombreTorneo,
            changes: changes,
          };
          const html = template(context);
          const mailOptions = {
            from: `"Esportscom" <${process.env.MAILER_ACC}>`,
            bcc: mailArray,
            subject: "Actualizacion del torneo: " + nombreTorneo, // Subject line
            html: html,
          };
          transporter.sendMail(mailOptions).catch((err) => {
            throw new Error(err);
          });
        }
      );
    }
  } catch (err) {
    throw new Error("Error al enviar correos");
  }
};
