const fs = require("fs");
const handlebars = require("handlebars");
const transporter = require("../config/mailer");

module.exports = function sendVerifyEmailLink(
  email,
  nombresInvocador,
  nombreTorneo,
  nombreCapitan,
  idEnfrentamiento
) {
  fs.readFile("./templates/notifyCaptain.html", "utf8", function (err, data) {
    if (err) throw err;
    const source = data.toString();
    const template = handlebars.compile(source);
    nombresInvocador.map((invocador) => invocador.concat("<br>"));
    const context = {
      username: nombreCapitan,
      torneo: nombreTorneo,
      invocadores: nombresInvocador,
      idenfrentamiento: idEnfrentamiento,
    };
    const html = template(context);
    const mailOptions = {
      from: `"Esportscom" <${process.env.MAILER_ACC}>`,
      to: email,
      subject: "Has sido nombrado capitan de enfrentamiento.", // Subject line
      html: html,
    };

    transporter.sendMail(mailOptions);
  });
};
