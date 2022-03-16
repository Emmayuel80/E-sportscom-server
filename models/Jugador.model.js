const BitacoraTorneo = require("./Bitacora_torneo.model");
const Torneos = require("./Torneos.model");
const UsuarioTorneoTFT = require("./Usuario_torneo_TFT.model");
const Usuario = require("./Usuario.model");
const Jugador = {};
const dbConn = require("../config/database");
const Equipos = require("./Equipos.model");
const UsuarioEquipo = require("./Usuario_equipo.model");
const EquipoTorneo = require("./Equipo_torneo.model");
const BitacoraEquipo = require("./Bitacora_equipo.model");
Jugador.getTorneosActivos = async function (start, number) {
  const torneos = await Torneos.getTorneosActivosNoPrivados(start, number);
  const total = await Torneos.getTotalTorneosActivosNoPrivados();
  const data = {
    torneos: torneos,
    total: total,
  };
  if (data.torneos.length <= 0) {
    throw new Error("No se encontraron torneos activos");
  } else return data;
};

Jugador.getTorneoByName = async function (nombre, start, number) {
  const torneos = await Torneos.getTorneoByName(nombre, start, number);
  const total = await Torneos.getTotalTorneoByName(nombre);
  const data = {
    torneos: torneos,
    total: total,
  };
  if (data.torneos.length <= 0) {
    throw new Error("No se encontraron torneos activos");
  } else return data;
};

Jugador.registerPlayerToTournament = async function (idTorneo, idUsuario) {
  const torneo = await Torneos.getById(idTorneo);
  if (torneo.length <= 0) throw new Error("El torneo no existe");
  if (torneo.id_estado > 0)
    throw new Error("El torneo no se encuentra en estado de registro");
  if (torneo.id_juego === 1) {
    // LoL
    throw new Error("El torneo no es de tipo TFT");
  } else if (torneo.id_juego === 2) {
    // TFT
    // check if the user is already registered
    const jugador = await UsuarioTorneoTFT.getJugadorTorneo(
      idTorneo,
      idUsuario
    );
    if (jugador.length > 0)
      throw new Error("El jugador ya está registrado en el torneo");
    if (
      (await UsuarioTorneoTFT.getCountJugadoresTorneo(idTorneo)) >=
      torneo.no_equipos
    )
      throw new Error("El torneo está lleno");
    // register the user
    const newUsuarioTorneoTFT = new UsuarioTorneoTFT({
      id_torneo: idTorneo,
      id_usuario: idUsuario,
      posicion: 0,
    });
    const data = await UsuarioTorneoTFT.create(newUsuarioTorneoTFT).catch(
      (err) => {
        throw new Error(err);
      }
    );
    if (data) {
      // register in the bitacora
      const usuario = await Usuario.findById(idUsuario);
      BitacoraTorneo.create(
        new BitacoraTorneo({
          id_torneo: idTorneo,
          id_usuario: torneo.id_usuario,
          desc_modificacion: `El usuario: ${usuario[0].nombre} se registró al torneo: ${torneo.nombre}.`,
        })
      );
      return { message: "Jugador registrado correctamente" };
    } else throw new Error("Error al registrar al jugador");
  }
};

Jugador.getActiveTournaments = async function (idUsuario, start, number) {
  const torneosTFT = await UsuarioTorneoTFT.getAllfromUsuario(idUsuario);
  const [fields] = await dbConn
    .promise()
    .query(
      " select t.* from torneos as t where t.id_estado <=2 and t.id_torneo in (select et.id_torneo from equipo_torneo as et, equipos as e, usuario_equipo as ue, usuarios as u where u.id_usuario=? and u.id_usuario=ue.id_usuario and ue.id_equipo=e.id_equipo and e.id_equipo=et.id_equipo);",
      [idUsuario]
    );
  const torneos = [...torneosTFT, ...fields].sort(
    (a, b) => a.fecha_inicio - b.fecha_inicio
  );

  const data = {
    torneos: torneos.slice(start, start + number),
    total: torneosTFT.length + fields.length,
  };
  if (data.torneos.length <= 0)
    throw new Error("No se encontraron torneos activos");
  return data;
};

Jugador.createEquipo = async function (idUsuario, equipo) {
  // check if the user already has/join 5 teams
  const equipos = await UsuarioEquipo.getTotalEquiposJugador(idUsuario);
  if (equipos >= 5) throw new Error("El jugador ya tiene 5 equipos");
  // create team
  const newEquipo = new Equipos({
    nombre: equipo.nombre,
    logo: equipo.logo,
  });
  return await Equipos.create(newEquipo, idUsuario);
};

Jugador.joinEquipo = async function (idUsuario, code) {
  // check if the team exists
  const equipo = await Equipos.getByCode(code);
  if (!equipo) throw new Error("El equipo no existe");
  // check if the user already has/join 5 teams
  const equipos = await UsuarioEquipo.getTotalEquiposJugador(idUsuario);
  if (equipos >= 5) throw new Error("El jugador ya tiene 5 equipos");
  // check if the user is already in the team
  const usuario = await UsuarioEquipo.getEquipoJugador(
    idUsuario,
    equipo.id_equipo
  );
  if (usuario) throw new Error("El jugador ya está en el equipo");
  // check if the team is full
  const equipoFull = await UsuarioEquipo.getTotalJugadoresEquipo(
    equipo.id_equipo
  );
  if (equipoFull >= 5) throw new Error("El equipo está lleno");

  // join the team
  const newUsuarioEquipo = new UsuarioEquipo({
    id_usuario: idUsuario,
    id_equipo: equipo.id_equipo,
    capitan: false,
  });
  return await UsuarioEquipo.create(newUsuarioEquipo);
};

Jugador.getEquipos = async function (idUsuario) {
  const [fields] = await dbConn
    .promise()
    .query(
      "select e.* from equipos as e, usuario_equipo as ue, usuarios as u where u.id_usuario=? and u.id_usuario=ue.id_usuario and ue.id_equipo=e.id_equipo ORDER BY e.fecha_creacion;",
      [idUsuario]
    )
    .catch((err) => {
      throw new Error(err);
    });
  if (fields.length <= 0) return [];
  return fields;
};

Jugador.editEquipo = async function (idUsuario, equipo) {
  // check if the user is the captain of the team
  const usuario = await UsuarioEquipo.getEquipoJugador(
    idUsuario,
    equipo.id_equipo
  );
  if (!usuario) throw new Error("El jugador no es el capitan del equipo");
  if (!usuario.capitan) throw new Error("El jugador no es capitan del equipo");
  // update team
  const oldEquipo = await Equipos.getById(equipo.id_equipo);
  if (oldEquipo.nombre === equipo.nombre && oldEquipo.logo === equipo.logo)
    throw new Error("El equipo no ha cambiado");

  await Equipos.update(equipo, idUsuario, oldEquipo.nombre, oldEquipo.logo);
};

Jugador.getTournamentbyCode = async function (code) {
  const torneo = await Torneos.getTorneoByCode(code);
  if (torneo.id_juego === 1) {
    // League of Legends
    const data = {
      torneo: torneo,
      participantes: await Torneos.getInfoEquipos(torneo.id_torneo),
    };
    return data;
  } else if (torneo.id_juego === 2) {
    // TFT
    const data = {
      torneo: torneo,
      participantes: await UsuarioTorneoTFT.getJugadoresTorneo(
        torneo.id_torneo
      ),
    };
    return data;
  }
};

// Get all tournaments

Jugador.getTournamentsHistory = async function (idUsuario, start, number) {
  const torneosTFT = await UsuarioTorneoTFT.getAllfromUsuario(idUsuario);
  const [fields] = await dbConn
    .promise()
    .query(
      " select t.* from torneos as t where t.id_torneo in (select et.id_torneo from equipo_torneo as et, equipos as e, usuario_equipo as ue, usuarios as u where u.id_usuario=? and u.id_usuario=ue.id_usuario and ue.id_equipo=e.id_equipo and e.id_equipo=et.id_equipo);",
      [idUsuario]
    );
  const torneos = [...torneosTFT, ...fields].sort(
    (a, b) => a.fecha_inicio - b.fecha_inicio
  );

  const data = {
    torneos: torneos.slice(start, start + number),
    total: torneosTFT.length + fields.length,
  };
  if (data.torneos.length <= 0)
    throw new Error("No se encontraron torneos activos");
  return data;
};

Jugador.kickPlayerFromTeam = async function (idUsuario, idEquipo, idJugador) {
  // check if the user is the captain of the team
  const usuario = await UsuarioEquipo.getEquipoJugador(idUsuario, idEquipo);
  if (!usuario) throw new Error("El jugador no es el capitan del equipo");
  if (!usuario.capitan) throw new Error("El jugador no es capitan del equipo");
  // check if the user is the player to kick
  const jugador = await UsuarioEquipo.getEquipoJugador(idJugador, idEquipo);
  if (!jugador) throw new Error("El jugador no existe en el equipo");
  if (jugador.capitan) throw new Error("El jugador es capitan del equipo");
  // kick the player
  // get team name
  const nombreEquipo = await Equipos.getNombre(idEquipo);
  await UsuarioEquipo.delete(idJugador, idEquipo, nombreEquipo);
};

Jugador.getEquipo = async function (idUsuario, idEquipo) {
  const equipo = await Equipos.getById(idEquipo);
  if (!equipo) throw new Error("El equipo no existe");
  const usuario = await UsuarioEquipo.getEquipoJugador(idUsuario, idEquipo);
  if (!usuario) throw new Error("El jugador no es parte del equipo");
  const jugadores = await Equipos.getPlayersInfo(idEquipo);
  const data = {
    equipo: equipo,
    jugadores: jugadores,
  };
  return data;
};
/* eslint-disable complexity */
Jugador.registerTeamToTournament = async function (
  idUsuario,
  idTorneo,
  idEquipo
) {
  const equipo = await Equipos.getById(idEquipo);
  if (!equipo) throw new Error("El equipo no existe");
  const usuario = await UsuarioEquipo.getEquipoJugador(idUsuario, idEquipo);
  if (!usuario) throw new Error("El jugador no es parte del equipo");
  if (!usuario.capitan) throw new Error("El jugador no es capitan del equipo");
  const torneo = await Torneos.getById(idTorneo);
  if (!torneo) throw new Error("El torneo no existe");
  // check if the tournament is already full
  const participantes = await EquipoTorneo.getTotalEquipos(idTorneo);
  if (participantes.total >= torneo.no_equipos)
    throw new Error("El torneo ya esta lleno");
  // check if the tournament is on register state
  if (torneo.id_estado !== 0)
    throw new Error("El torneo no esta en estado de registro");
  const totalJugadoresEquipo = await UsuarioEquipo.getTotalJugadoresEquipo(
    idEquipo
  );
  if (totalJugadoresEquipo.total < 5)
    throw new Error("El equipo no tiene la cantidad de jugadores requerida");
  // register the team
  if (torneo.id_juego === 1) {
    // League of Legends
    const newEquipoTorneo = new EquipoTorneo({
      id_torneo: idTorneo,
      id_equipo: idEquipo,
      estado: true,
      no_equipo: participantes.total + 1,
    });
    await EquipoTorneo.create(newEquipoTorneo);
    const newBitacoraEquipo = new BitacoraEquipo({
      id_usuario: idUsuario,
      id_equipo: idEquipo,
      desc_modificacion: `El equipo ${equipo.nombre} se ha registrado al torneo ${torneo.nombre}`,
    });
    await BitacoraEquipo.create(newBitacoraEquipo);
    return { msg: "Equipo registrado" };
  } else throw new Error("El torneo no es de League of Legends");
};
module.exports = Jugador;
