const dbConn = require("../config/database");
const RoundRobin = require("../services/tournaments/RoundRobin");
const UsuarioTorneoTFT = require("../models/Usuario_torneo_TFT.model");
module.exports = async function () {
  console.log("[DAEMON] Check fecha inicio torneos");
  const [fields] = await dbConn
    .promise()
    .query("SELECT * FROM torneos WHERE fecha_inicio <= NOW() AND id_estado=1");
  const torneosIniciados = fields;
  if (torneosIniciados.length > 0) {
    torneosIniciados.forEach(async (torneo) => {
      const d = new Date();
      d.setTime(
        d.getTime() +
          d.getTimezoneOffset() * 60 * 1000 /* convert to UTC */ +
          /* UTC-6 */ -6 * 60 * 60 * 1000
      );
      if (torneo.hora_inicio !== d.getHours()) {
        return;
      }
      if (torneo.id_juego === 1) {
        // LOL
        console.log("[DAEMON] Iniciando torneo LOL");
      } else {
        // TFT
        console.log("[DAEMON] Iniciando torneo TFT");
        const participantes = await UsuarioTorneoTFT.getJugadoresTorneo(
          torneo.id_torneo
        );
        if (participantes.length !== torneo.no_equipos) {
          return;
        }
        const rr = new RoundRobin({
          id: torneo.id_torneo,
          size: torneo.no_equipos,
          players: participantes,
        });
        rr.startEvent();
        const [fields] = await dbConn
          .promise()
          .query(
            "SELECT * FROM enfrentamiento_tft where id_torneo = ? and date(fecha_creado)= date(NOW())",
            torneo.id_torneo
          );
        if (fields.length > 0) {
          return;
        }
        rr.matches.forEach((match) => {
          const nombresInvocador = [];
          match.players.forEach((element) =>
            nombresInvocador.push(element.nombre_invocador)
          );
          dbConn
            .promise()
            .query(
              "INSERT INTO enfrentamiento_tft(id_torneo, json_data) VALUES (?,?)",
              [torneo.id_torneo, JSON.stringify(match)]
            )
            .then(([fields, rows]) => {
              require("../services/sendNotifCapitan")(
                match.captain.email,
                nombresInvocador,
                torneo.nombre,
                match.captain.nombre,
                fields.insertId
              );
            });
        });
      }
    });
  }
};
