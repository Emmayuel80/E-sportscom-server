const dbConn = require("../config/database");
const RoundRobin = require("../services/tournaments/RoundRobin");
const UsuarioTorneoTFT = require("../models/Usuario_torneo_TFT.model");
const Torneos = require("../models/Torneos.model");
const BitacoraTorneo = require("../models/Bitacora_torneo.model");
module.exports = async function () {
  console.log("[DAEMON] Check fecha inicio torneos");
  const [fields] = await dbConn
    .promise()
    .query(
      "SELECT * FROM torneos WHERE fecha_inicio <= NOW() AND id_estado=1 OR id_estado=2"
    );
  const torneosIniciados = fields;
  if (torneosIniciados.length > 0) {
    torneosIniciados.forEach(async (torneo) => {
      const d = new Date();
      d.setTime(
        d.getTime() +
          d.getTimezoneOffset() * 60 * 1000 /* convert to UTC */ +
          /* UTC-5 */ -5 * 60 * 60 * 1000
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
        const participantes = await UsuarioTorneoTFT.getJugadoresNoEliminados(
          torneo.id_torneo
        );
        // check if participantes length is a multiple of 8
        if (participantes.length % 8 !== 0) {
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
            "SELECT * FROM enfrentamiento_tft where id_torneo = ? and id_riot_match is null",
            torneo.id_torneo
          );
        if (fields.length > 0) {
          return;
        }
        if (torneo.id_estado === 1) {
          Torneos.updateEstado(torneo.id_torneo, 2);
          const newBitacoraTorneo = new BitacoraTorneo({
            id_torneo: torneo.id_torneo,
            id_usuario: torneo.id_usuario,
            desc_modificacion: `Se ha iniciado el torneo: ${torneo.nombre}.`,
          });
          BitacoraTorneo.create(newBitacoraTorneo);
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
