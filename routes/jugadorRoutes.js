const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize.js");
const Jugador = require("../models/Jugador.model");
const Torneos = require("../models/Torneos.model");
const Usuario = require("../models/Usuario.model.js");
const UsuarioTorneoTFT = require("../models/Usuario_torneo_TFT.model.js");
router.get(
  "/getTorneosActivos/:start/:number",
  authorize("jugador"),
  async (req, res) => {
    const { start, number } = req.params;
    try {
      const data = await Jugador.getTorneosActivos(start, number);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener los torneos activos",
        error,
      });
    }
  }
);

// get tournament by name
router.get(
  "/getTorneoByName/:start/:number",
  authorize("jugador"),
  async (req, res) => {
    const { start, number } = req.params;
    const name = req.query.name;
    try {
      const data = await Jugador.getTorneoByName(name, start, number);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener los torneos activos",
        err: error.toString(),
      });
    }
  }
);

// register to tft tournament
router.post(
  "/registerPlayerToTournament",
  authorize("jugador"),
  async (req, res) => {
    const { idTorneo } = req.body;
    try {
      const data = await Jugador.registerPlayerToTournament(
        idTorneo,
        req.user.sub
      );
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({
        message: "Error al registrar al jugador",
        error: error.toString(),
      });
    }
  }
);

// get tournament data
router.get(
  "/getTorneoData/:idTorneo",
  authorize("jugador"),
  async (req, res) => {
    const { idTorneo } = req.params;
    try {
      const torneo = await Torneos.getById(idTorneo);
      let participantes;
      if (torneo.id_juego === 1) {
        // LoL
        participantes = await Torneos.getInfoEquipos(torneo.id_torneo);
      } else if (torneo.id_juego === 2) {
        // TFT
        participantes = await UsuarioTorneoTFT.getJugadoresTorneo(
          torneo.id_torneo
        );
      }
      const organizador = await Usuario.findById(torneo.id_usuario);
      res
        .status(200)
        .json({
          ...torneo,
          participantes: participantes,
          organizador: organizador[0].nombre,
        });
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener el torneo",
        error: error.toString(),
      });
    }
  }
);

// get torneos jugador
router.get(
  "/getTorneosJugador/:start/:number",
  authorize("jugador"),
  async (req, res) => {
    const { start, number } = req.params;
    try {
      const data = await Jugador.getActiveTournaments(
        req.user.sub,
        Number(start),
        Number(number)
      );
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener los torneos jugador",
        error: error.toString(),
      });
    }
  }
);

module.exports = router;
