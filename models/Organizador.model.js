const Organizador = {};
const Torneos = require("./Torneos.model");
const BitacoraTorneo = require("./Bitacora_torneo.model");
Organizador.getDashboardData = async function (idUsuario) {
  const data = {};
  try {
    data.torneosActivos = await Torneos.getTorneosActivos(idUsuario);
    data.torneosCreados = await Torneos.getTorneosCreados(idUsuario);
    data.latestTorneoCreado = await Torneos.getLatestTorneoCreado(idUsuario);
    data.latestActivity = await BitacoraTorneo.getLatestActivity(idUsuario);
  } catch (err) {
    data.error = err;
  }
  return data;
};

module.exports = Organizador;
