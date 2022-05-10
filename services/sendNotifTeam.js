const fs = require("fs");
const handlebars = require("handlebars");
const transporter = require("../config/mailer");

module.exports = function notifyTeam(emails, target, changes) {
  fs.readFile(
    "./templates/notificationTemplate.html",
    "utf8",
    function (err, data) {
      if (err) throw err;
      const source = data.toString();
      const template = handlebars.compile(source);
      const context = {
        username: emails[0].nombreEquipo,
        target: target,
        cambios: changes,
      };
      const listofEmails = emails.map((email) => email.email);
      const html = template(context);
      const mailOptions = {
        from: `"Esportscom" <${process.env.MAILER_ACC}>`,
        bcc: listofEmails,
        subject: `Se han hecho cambios en el equipo: ${target}.`, // Subject line
        html: html,
      };

      transporter.sendMail(mailOptions);
    }
  );
};
