const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize.js");
const Organizador = require("../models/Organizador.model.js");
const Torneos = require("../models/Torneos.model.js");

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
router.post("/createTournament", authorize("organizador"), (req, res) => {
  const newTornament = new Torneos(req.body);
  Torneos.create(newTornament, req.user.sub)
    .then((data) => {
      res.status(200).json({ msg: "Tornament created" });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Error al crear el torneo", err: err });
    });
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

module.exports = router;
