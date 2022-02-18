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

module.exports = router;
