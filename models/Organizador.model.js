const Organizador = {};
const Torneos = require('./Torneos.model');
const BitacoraTorneo = require('./Bitacora_torneo.model');
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
		throw new Error('El torneo no se encuentra en estado de edición');
	}
	console.log(typeof data.fecha_fin_registro);
	if (typeof '' === typeof data.fecha_fin_registro) {
		data.fecha_fin_registro = new Date(data.fecha_fin_registro);
	}
	if (typeof '' === typeof data.fecha_inicio) {
		data.fecha_inicio = new Date(data.fecha_inicio);
	}
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
  const total = await Torneos.getTotalTorneos(idUsuario);
  const data = {
    torneos: torneos,
    total: total,
  };
  if (data.torneos.length <= 0) {
    throw new Error("No se encontraron torneos creados");
  } else return data;
};

module.exports = Organizador;
