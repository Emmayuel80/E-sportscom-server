const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize.js");
const Organizador = require("../models/Organizador.model.js");

router.get("/dashboardData", authorize("organizador"), (req, res) => {
    const data = Organizador.getDashboardData(req.user.id_usuario);
    if(data.error){
        res.status(500).json({
            message: "Error al obtener los datos del dashboard",
            error: data.error
        });
    } else {
        res.status(200).json(data);
    }
})
module.exports = router;
