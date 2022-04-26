const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize.js");
const Organizador = require("../models/Organizador.model.js");
const Torneos = require("../models/Torneos.model.js");
const BitacoraTorneo = require("../models/Bitacora_torneo.model.js");

router.get("/dashboardData", authorize("organizador"), async (req, res) => {
  const data = await Organizador.getDashboardData(req.user.sub);
  if (data.error) {
    res.status(500).json({
      message: "Error al obtener los datos del dashboard",
      error: data.error,
    });
  } else {
    res.status(200).json(data);
  }
});

// create a tournament
router.post("/createTournament", authorize("organizador"), async (req, res) => {
  const newTornament = new Torneos({ ...req.body, id_usuario: req.user.sub });
  const activeTournaments = await Torneos.getTorneosActivos(req.user.sub, true);
  if (activeTournaments[0].numero > 5) {
    res
      .status(422)
      .json({ err: "Solo se pueden tener un maximo de 5 torneos activos" });
  } else {
    Torneos.create(newTornament, req.user.sub)
      .then((data) => {
        res.status(200).json({ msg: "Tornament created" });
      })
      .catch((err) => {
        res
          .status(500)
          .json({ msg: "Error al crear el torneo", err: err.toString() });
      });
  }
});

// update a tournament
router.put(
  "/updateTournament/:id",
  authorize("organizador"),
  async (req, res) => {
    const { id } = req.params;
    const updateTournament = req.body;
    // check if the tournament belongs to the user
    try {
      await Organizador.editTorneo(id, req.user.sub, updateTournament);
      res.status(200).json({ msg: "Tornament updated" });
    } catch (error) {
      res
        .status(500)
        .json({ msg: "Error al actualizar el torneo", err: error.toString() });
    }
  }
);

// update a tournament
router.put(
  "/cancelTournament/:idTorneo",
  authorize("organizador"),
  async (req, res) => {
    const { idTorneo } = req.params;
    // check if the tournament belongs to the user
    try {
      await Organizador.cancelTorneo(idTorneo, req.user.sub);
      res.status(200).json({ msg: "Tornament cancel" });
    } catch (error) {
      res
        .status(500)
        .json({ msg: "Error al cancelar el torneo", err: error.toString() });
    }
  }
);

// get all tournaments of the user by range
router.get(
  "/tournaments/:start/:number",
  authorize("organizador"),
  async (req, res) => {
    const { start, number } = req.params;
    try {
      const data = await Organizador.getTorneosCreados(
        req.user.sub,
        start,
        number
      );
      if (data.error) {
        res.status(500).json({
          message: "Error al obtener los torneos",
          error: data.error,
        });
      } else {
        res.status(200).json(data);
      }
    } catch (err) {
      res
        .status(500)
        .json({ msg: "Error al obtener los torneos", err: err.toString() });
    }
  }
);

// get all active tournaments
router.get("/activeTournaments", authorize("organizador"), async (req, res) => {
  try {
    const data = await Torneos.getTorneosActivos(req.user.sub);
    if (data.error) {
      res.status(500).json({
        message: "Error al obtener los torneos activos",
        error: data.error,
      });
    } else {
      res.status(200).json(data);
    }
  } catch (err) {
    res.status(500).json({
      msg: "Error al obtener los torneos activos",
      err: err.toString(),
    });
  }
});

// get tournament data
router.get(
  "/tournamentData/:idTorneo",
  authorize("organizador"),
  async (req, res) => {
    const { idTorneo } = req.params;
    try {
      const data = await Organizador.getTournamentData(idTorneo, req.user.sub);
      if (data.error) {
        res.status(500).json({
          message: "Error al obtener los datos del torneo",
          error: data.error,
        });
      } else {
        res.status(200).json(data);
      }
    } catch (err) {
      res.status(500).json({
        msg: "Error al obtener los datos del torneo",
        err: err.toString(),
      });
    }
  }
);

// delete player or team from a tournament
router.delete(
  "/kickPlayerOrTeam/:idTorneo/:kickId",
  authorize("organizador"),
  async (req, res) => {
    const { idTorneo, kickId } = req.params;
    try {
      await Organizador.kickPlayerOrTeam(idTorneo, req.user.sub, kickId);
      res.status(200).json({ msg: "Se kickeo al jugador o equipo." });
    } catch (err) {
      res.status(500).json({
        msg: "Error al eliminar el jugador o equipo",
        err: err.toString(),
      });
    }
  }
);

// registrar resultado partida LOL
router.put(
  "/registerResultLOL/:idGanador/:idPartida",
  authorize("organizador"),
  async (req, res) => {
    const { idGanador, idPartida } = req.params;
    try {
      await Organizador.registrarResultadoLOL(idPartida, parseInt(idGanador));
      res.status(200).json({ msg: "Se registro el resultado." });
    } catch (err) {
      res.status(500).json({
        msg: "Error al registrar el resultado",
        err: err.toString(),
      });
    }
  }
);

// get bitacora from torneo
router.get(
  "/bitacora/:idTorneo",
  authorize("organizador"),
  async (req, res) => {
    const { idTorneo } = req.params;
    try {
      const data = await BitacoraTorneo.getAllFromTorneo(idTorneo);
      if (data.error) {
        res.status(500).json({
          message: "Error al obtener la bitacora",
          error: data.error,
        });
      } else {
        res.status(200).json(data);
      }
    } catch (err) {
      res.status(500).json({
        msg: "Error al obtener la bitacora",
        err: err.toString(),
      });
    }
  }
);

module.exports = router;
