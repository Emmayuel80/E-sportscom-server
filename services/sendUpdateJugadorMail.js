const fs = require("fs");
const handlebars = require("handlebars");
const transporter = require("../config/mailer");

module.exports = function sendVerifyEmailLink(
  email,
  username,
  target,
  cambios
) {
  fs.readFile(
    "./templates/notificationTemplate.html",
    "utf8",
    function (err, data) {
      if (err) throw err;
      const source = data.toString();
      const template = handlebars.compile(source);
      const context = {
        username: username,
        target: target,
        cambios: cambios,
      };
      const html = template(context);
      const mailOptions = {
        from: `"Esportscom" <${process.env.MAILER_ACC}>`,
        to: email,
        subject: "Notificación de Esportscom", // Subject line
        html: html,
      };

      transporter.sendMail(mailOptions);
    }
  );
};
