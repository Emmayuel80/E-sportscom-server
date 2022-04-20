const fs = require("fs");
const handlebars = require("handlebars");
const transporter = require("../config/mailer");

module.exports = function sendVerifyEmailLink(
  emails,
  nombresInvocador,
  nombreTorneo,
  emailOrganizador
) {
  fs.readFile(
    "./templates/notificationCaptainLOL.html",
    "utf8",
    function (err, data) {
      if (err) throw err;
      const source = data.toString();
      const template = handlebars.compile(source);
      nombresInvocador.map((invocador) =>
        invocador.nombre_invocador.concat("<br>")
      );
      const listOfNombresInvocador = nombresInvocador.map(
        (invocador) => invocador.nombre_invocador
      );
      const context = {
        username: emails[0].nombreEquipo,
        torneo: nombreTorneo,
        invocadores: listOfNombresInvocador,
        email_organizador: emailOrganizador,
      };
      const listofEmails = emails.map((email) => email.email);
      const html = template(context);
      const mailOptions = {
        from: `"Esportscom" <${process.env.MAILER_ACC}>`,
        bcc: listofEmails,
        subject: "Has sido nombrado capitan de la partida.", // Subject line
        html: html,
      };

      transporter.sendMail(mailOptions);
    }
  );
};
