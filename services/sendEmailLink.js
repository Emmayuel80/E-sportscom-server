const fs = require("fs");
const handlebars = require("handlebars");
const transporter = require("../config/mailer");

module.exports = function sendVerifyEmailLink(email, link, username) {
  fs.readFile(
    "./templates/verifyEmailTemplate.html",
    "utf8",
    function (err, data) {
      if (err) throw err;
      const source = data.toString();
      const template = handlebars.compile(source);
      const context = {
        username: username,
        link: link,
      };
      const html = template(context);
      const mailOptions = {
        from: `"Esportscom" <${process.env.MAILER_ACC}>`,
        to: email,
        subject: "Verifica tu cuenta.", // Subject line
        html: html,
      };

      transporter.sendMail(mailOptions);
    }
  );
};
