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
