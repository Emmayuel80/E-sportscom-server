const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  pool: true,
  auth: {
    user: process.env.MAILER_ACC,
    pass: process.env.MAILER_PASS,
  },
});

transporter.verify().then(() => {
  console.log("Listo para enviar emails");
});

module.exports = transporter;
