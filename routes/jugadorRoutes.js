const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize.js");
const Jugador = require("../models/Jugador.model");
const Torneos = require("../models/Torneos.model");
const Usuario = require("../models/Usuario.model.js");
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
      const data = await Jugador.registerPlayerToTournament(idTorneo, req.user.sub);
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
      const organizador = await Usuario.findById(torneo.id_usuario);
      res.status(200).json({...torneo, organizador: organizador[0].nombre});
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener el torneo",
        error: error.toString(),
      });
    }
  }
);


module.exports = router;
