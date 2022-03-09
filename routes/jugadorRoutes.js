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

// register to lol tournament
router.post(
  "/registerTeamToTournament",
  authorize("jugador"),
  async (req, res) => {
    const { idTorneo, idEquipo } = req.body;
    try {
      const data = await Jugador.registerTeamToTournament(
        req.user.sub,
        idTorneo,
        idEquipo
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
      res.status(200).json({
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

// create a team
router.post("/createTeam", authorize("jugador"), async (req, res) => {
  const { nombre, logo } = req.body;
  const equipo = {
    nombre,
    logo,
  };
  try {
    const data = await Jugador.createEquipo(req.user.sub, equipo);
    res.status(200).json({
      message: "Equipo creado",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear el equipo",
      error: error.toString(),
    });
  }
});

// join team
router.post("/joinTeam", authorize("jugador"), async (req, res) => {
  const { codigo } = req.body;
  try {
    const data = await Jugador.joinEquipo(req.user.sub, codigo);
    res.status(200).json({
      message: "Se ha unido al equipo",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al unirse al equipo",
      error: error.toString(),
    });
  }
});

// get teams
router.get("/getEquipos", authorize("jugador"), async (req, res) => {
  try {
    const data = await Jugador.getEquipos(req.user.sub);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los equipos",
      error: error.toString(),
    });
  }
});

// update team
router.put("/updateEquipo", authorize("jugador"), async (req, res) => {
  const equipo = req.body;
  try {
    await Jugador.editEquipo(req.user.sub, equipo);
    res.status(200).json({ msg: "Equipo actualizado" });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el equipo",
      error: error.toString(),
    });
  }
});

// Get tournament by Code
router.get("/getTournamentByCode", authorize("jugador"), async (req, res) => {
  const code = req.query.code;
  try {
    const data = await Jugador.getTournamentbyCode(code);
    if (!data) {
      res.status(404).json({
        message: "El torneo no existe",
      });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los datos del torneo",
      error: error.toString(),
    });
  }
});

router.get(
  "/getHistorialTorneos/:start/:number",
  authorize("jugador"),
  async (req, res) => {
    const { start, number } = req.params;
    try {
      const data = await Jugador.getTournamentsHistory(
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

// kick player from team
router.delete("/kickPlayerFromTeam", authorize("jugador"), async (req, res) => {
  const { idEquipo, idJugador } = req.body;
  try {
    await Jugador.kickPlayerFromTeam(req.user.sub, idEquipo, idJugador);
    res.status(200).json({
      message: "Jugador expulsado del equipo",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al expulsar al jugador del equipo",
      error: error.toString(),
    });
  }
});

// get equipo
router.get("/getEquipo/:idEquipo", authorize("jugador"), async (req, res) => {
  const { idEquipo } = req.params;
  try {
    const data = await Jugador.getEquipo(req.user.sub, idEquipo);
    if (!data) {
      res.status(404).json({
        message: "El equipo no existe",
      });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los datos del equipo",
      error: error.toString(),
    });
  }
});

module.exports = router;
