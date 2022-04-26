const dbConn = require("../config/database");
const RoundRobin = require("../services/tournaments/RoundRobin");
const UsuarioTorneoTFT = require("../models/Usuario_torneo_TFT.model");
const Torneos = require("../models/Torneos.model");
const EquipoTorneo = require("../models/Equipo_torneo.model");
const BitacoraTorneo = require("../models/Bitacora_torneo.model");
const Elimination = require("../services/tournaments/Elimination");
const PartidaLol = require("../models/Partida_lol.model");
const Usuario = require("../models/Usuario.model");
const Equipos = require("../models/Equipos.model");
/* eslint-disable */
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
        const equipos = await EquipoTorneo.getEquiposNoEliminados(
          torneo.id_torneo
        );
        const totalEquipos = await EquipoTorneo.getTotalEquipos(
          torneo.id_torneo
        );
        if (totalEquipos.total !== torneo.no_equipos) {
          console.log(
            "[DAEMON] No se puede iniciar torneo, equipos insuficientes"
          );
          //  Cancelar torneo
          Torneos.updateEstado(torneo.id_torneo, 4);
          const newBitacoraTorneo = new BitacoraTorneo({
            id_torneo: torneo.id_torneo,
            id_usuario: torneo.id_usuario,
            desc_modificacion: `Se ha cancelado el torneo: ${torneo.nombre}. Razon: Equipos insuficientes.`,
          });
          BitacoraTorneo.create(newBitacoraTorneo);
          require("../services/sendUpdateTournamentMail")(
            torneo,
            torneo.nombre,
            "El torneo ha sido cancelado por falta de equipos."
          );
          return;
        }
        // check si hay suficientes equipos
        if (equipos.length < 2) {
          console.log("[DAEMON] No hay suficientes equipos");
          return;
        }

        const [fields] = await dbConn
          .promise()
          .query(
            "SELECT * FROM partida_lol where id_torneo = ? and id_ganador is null",
            torneo.id_torneo
          );
        if (fields.length > 0) {
          return;
        }

        const elimination = new Elimination({
          id: torneo.id_torneo,
          teams: equipos,
        });

        elimination.startEvent();
        console.log("Torneo", elimination);
        const organizador = await Usuario.findById(torneo.id_usuario);
        for (let i = 0; i < elimination.matches.length; i++) {
          const match = elimination.matches[i];
          const partida = new PartidaLol({
            id_torneo: elimination.id,
            id_equipo1: match.team1.id_equipo,
            id_equipo2: match.team2.id_equipo,
            etapa: match.round,
          });
          await PartidaLol.create(partida);
          const emails = await Equipos.getEmails(match.team1.id_equipo);
          const nombresInvocador = await Equipos.getEmailsFromTeams([
            match.team1.id_equipo,
            match.team2.id_equipo,
          ]);
          require("../services/sendNotifCapitanLOL")(
            emails,
            nombresInvocador,
            torneo.nombre,
            organizador[0].email
          );
        }
        // actualizar estado del torneo
        if (torneo.id_estado === 1) {
          Torneos.updateEstado(torneo.id_torneo, 2);
          const newBitacoraTorneo = new BitacoraTorneo({
            id_torneo: torneo.id_torneo,
            id_usuario: torneo.id_usuario,
            desc_modificacion: `Se ha iniciado el torneo: ${torneo.nombre}.`,
          });
          BitacoraTorneo.create(newBitacoraTorneo);
        }
        const llave = (await Torneos.getObjLlave(torneo.id_torneo)) || {};
        llave[`${elimination.round}`] = elimination.matches;
        await Torneos.updateObjLlave(torneo.id_torneo, llave);
      } else {
        // TFT
        console.log("[DAEMON] Iniciando torneo TFT");
        const participantes = await UsuarioTorneoTFT.getJugadoresNoEliminados(
          torneo.id_torneo
        );
        // check if participantes length is a multiple of 8
        if (participantes.length % 8 !== 0) {
          console.log(
            "[DAEMON] No se puede iniciar torneo, jugadores insuficientes"
          );
          //  Cancelar torneo
          Torneos.updateEstado(torneo.id_torneo, 4);
          const newBitacoraTorneo = new BitacoraTorneo({
            id_torneo: torneo.id_torneo,
            id_usuario: torneo.id_usuario,
            desc_modificacion: `Se ha cancelado el torneo: ${torneo.nombre}. Razon: Jugadores insuficientes.`,
          });
          BitacoraTorneo.create(newBitacoraTorneo);
          require("../services/sendUpdateTournamentMail")(
            torneo,
            torneo.nombre,
            "El torneo ha sido cancelado por falta de equipos."
          );
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
