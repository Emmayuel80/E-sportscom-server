/* eslint-disable no-undef */
require("dotenv").config();

test("Debe regresar el torneo 11 si fue creado por el organizador 17", async () => {
  const Torneos = require("../models/Torneos.model");
  const torneo = await Torneos.getTorneoCreado(11, 17);
  expect(torneo.id_torneo).toBe(11);
});
