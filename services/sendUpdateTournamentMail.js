const fs = require("fs");
const handlebars = require("handlebars");
const transporter = require("../config/mailer");

module.exports = function sendUpdateTournamentMail(
  mails,
  nombreTorneo,
  changes
) {
  return new Promise((resolve, reject) => {
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

        transporter
          .sendMail(mailOptions)
          .then(() => {
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      }
    );
  });
};
