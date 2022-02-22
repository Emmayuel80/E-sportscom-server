const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize.js");
const Jugador = require("../models/Jugador.model");

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
    const name = req.body.name;
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

module.exports = router;
