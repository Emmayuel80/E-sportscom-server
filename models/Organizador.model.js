const Organizador = {};
const Torneos = require("./Torneos.model");
const BitacoraTorneo = require("./Bitacora_torneo.model");
const UsuarioTorneoTFT = require("./Usuario_torneo_TFT.model");
const EquipoTorneo = require("./Equipo_torneo.model");

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

// edit a tournament and notify the teams about the changes via email
Organizador.editTorneo = async function (idTorneo, idUsuario, data) {
  const torneo = await Torneos.getTorneoCreado(idTorneo, idUsuario);
  if (torneo.id_estado > 0) {
    throw new Error("El torneo no se encuentra en estado de edición");
  }
  data = require("../services/checkDate")(data);
  await Torneos.update(idTorneo, data, torneo, idUsuario);
};
module.exports = Organizador;

// Cancel a tournament and notify the teams about the changes via email
Organizador.cancelTorneo = async function (idTorneo, idUsuario) {
  const torneo = await Torneos.getTorneoCreado(idTorneo, idUsuario);
  if (torneo.id_estado > 3) {
    throw new Error("El torneo no se puede cancelar");
  }
  await Torneos.cancel(idTorneo, idUsuario, torneo);
};

// get the list of tournaments created by the user on range
Organizador.getTorneosCreados = async function (idUsuario, start, end) {
  const torneos = await Torneos.getRangeOfTorneos(idUsuario, start, end);
  const total = await Torneos.getTorneosCreados(idUsuario, true);
  const data = {
    torneos: torneos,
    total: total[0],
  };
  if (data.torneos.length <= 0) {
    throw new Error("No se encontraron torneos creados");
  } else return data;
};

Organizador.getTournamentData = async function (idTorneo, idUsuario) {
  const torneo = await Torneos.getTorneoCreado(idTorneo, idUsuario);
  if (torneo.id_juego === 1) {
    // League of Legends
    const data = {
      torneo: torneo,
      participantes: await Torneos.getInfoEquipos(idTorneo),
    };
    return data;
  } else if (torneo.id_juego === 2) {
    // TFT
    const data = {
      torneo: torneo,
      participantes: await UsuarioTorneoTFT.getJugadoresTorneo(idTorneo),
    };
    return data;
  }
};

Organizador.getActiveTournament = async function (idUsuario) {
  const torneosActivos = await Torneos.getTorneosActivos(idUsuario, true);
  return torneosActivos;
};

Organizador.kickPlayerOrTeam = async function (idTorneo, idUsuario, kickId) {
  const torneo = await Torneos.getTorneoCreado(idTorneo, idUsuario);
  if (torneo.id_estado > 0) {
    throw new Error("El torneo no se encuentra en estado de edición");
  }
  if (torneo.id_juego === 1) {
    // League of Legends
    await EquipoTorneo.kickEquipo(idTorneo, idUsuario, kickId, torneo.nombre);
  } else if (torneo.id_juego === 2) {
    // TFT
    await UsuarioTorneoTFT.kickParticipante(
      idTorneo,
      idUsuario,
      kickId,
      torneo.nombre
    );
  }
};

module.exports = Organizador;
