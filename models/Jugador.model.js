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
const leagueApi = require("../config/riotApi");
const tftApi = require("../config/tftApi");
const EnfrentamientoTft = require("./Enfrentamiento_tft.model");
const apiConstants = require("twisted").Constants;
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
  if (!usuario) throw new Error("El jugador no es el capitán del equipo");
  if (!usuario.capitan) throw new Error("El jugador no es capitán del equipo");
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
  if (!usuario) throw new Error("El jugador no es el capitán del equipo");
  if (!usuario.capitan) throw new Error("El jugador no es capitán del equipo");
  // check if the user is the player to kick
  const jugador = await UsuarioEquipo.getEquipoJugador(idJugador, idEquipo);
  if (!jugador) throw new Error("El jugador no existe en el equipo");
  if (jugador.capitan) throw new Error("El jugador es capitán del equipo");
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
  if (!usuario.capitan) throw new Error("El jugador no es capitán del equipo");
  const torneo = await Torneos.getById(idTorneo);
  if (!torneo) throw new Error("El torneo no existe");
  // check if the tournament is already full
  const participantes = await EquipoTorneo.getTotalEquipos(idTorneo);
  if (participantes.total >= torneo.no_equipos)
    throw new Error("El torneo ya está lleno");
  // check if the tournament is on register state
  if (torneo.id_estado !== 0)
    throw new Error("El torneo no está en estado de registro");
  const totalJugadoresEquipo = await UsuarioEquipo.getTotalJugadoresEquipo(
    idEquipo
  );
  if (totalJugadoresEquipo.total < 5)
    throw new Error("El equipo no tiene la cantidad de jugadores requerida");
  // check if someone in the team is already registered
  const jugadores = await Equipos.getPlayersInfo(idEquipo);
  const jugadoresTorneo = await Torneos.getInfoEquipos(idTorneo);
  const jugadoresTorneoIds = jugadoresTorneo.map(
    (jugador) => jugador.id_usuario
  );
  const jugadoresIds = jugadores.map((jugador) => jugador.id_usuario);
  const jugadoresEnTorneo = jugadoresIds.filter((id) =>
    jugadoresTorneoIds.includes(id)
  );
  if (jugadoresEnTorneo.length > 0)
    throw new Error("Algun jugador ya está registrado en el torneo.");
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

// get the teams from the captain that are full
Jugador.getEquiposCompletosDeCapitan = async function (idUsuario) {
  const equipos = await UsuarioEquipo.getEquiposDeCapitan(idUsuario);
  const promises = [];
  return new Promise((resolve, reject) => {
    const listaEquipos = [];
    if (!equipos) reject(new Error("El jugador no tiene equipos").toString());
    equipos.forEach((element) => {
      promises.push(
        UsuarioEquipo.getTotalJugadoresEquipo(element.id_equipo)
          .then((total) => {
            if (total === 5) {
              return Equipos.getById(element.id_equipo);
            }
          })
          .then((equipo) => {
            if (equipo) {
              listaEquipos.push(equipo);
            }
          })
      );
    });
    Promise.all(promises).then(() => resolve(listaEquipos));
  });
};

Jugador.deletePlayerFromTeam = async function (idJugador, idEquipo) {
  const jugador = await UsuarioEquipo.getEquipoJugador(idJugador, idEquipo);
  if (!jugador) throw new Error("El jugador no existe en el equipo");
  if (jugador.capitan) throw new Error("El jugador es capitán del equipo");
  // kick the player
  // get team name
  const nombreEquipo = await Equipos.getNombre(idEquipo);
  await UsuarioEquipo.delete(idJugador, idEquipo, nombreEquipo, false);
};

Jugador.getProfile = async function (idUsuario) {
  const usuario = await Usuario.findById(idUsuario);
  if (!usuario) throw new Error("El usuario no existe");
  const torneosGanadosTFT = await UsuarioTorneoTFT.getTorneosGanados(idUsuario);
  const torneosParticipadosTFT = await UsuarioTorneoTFT.getTorneosParticipados(
    idUsuario
  );
  const torneosGanadosLOL = await EquipoTorneo.getTorneosGanados(idUsuario);
  const torneosParticipadosLOL = await EquipoTorneo.getTorneosParticipados(
    idUsuario
  );
  const data = {
    usuario: usuario,
    torneosGanadosTFT: torneosGanadosTFT,
    torneosParticipadosTFT: torneosParticipadosTFT,
    torneosGanadosLOL: torneosGanadosLOL,
    torneosParticipadosLOL: torneosParticipadosLOL,
  };
  return data;
};

Jugador.actualizarRiotApi = async function (idUsuario) {
  const usuario = await Usuario.findById(idUsuario);
  if (!usuario) throw new Error("El usuario no existe");
  if (!usuario[0].nombre_invocador)
    throw new Error("El usuario no tiene nombre de invocador");
  const summonerLOL = await leagueApi.Summoner.getByName(
    usuario[0].nombre_invocador,
    apiConstants.Regions.LAT_NORTH
  );
  console.log(summonerLOL);
  const summonerLeagueLOL = await leagueApi.League.bySummoner(
    summonerLOL.response.id,
    apiConstants.Regions.LAT_NORTH
  );
  console.log(summonerLeagueLOL);
  const masteryLOL = await leagueApi.Champion.masteryBySummoner(
    summonerLOL.response.id,
    apiConstants.Regions.LAT_NORTH
  );
  const summonerTFT = await tftApi.Summoner.getByName(
    usuario[0].nombre_invocador,
    apiConstants.Regions.LAT_NORTH
  );
  const summonerLeagueTFT = await tftApi.League.get(
    summonerTFT.response.id,
    apiConstants.Regions.LAT_NORTH
  );
  console.log(summonerLeagueTFT);
  const data = {
    summonerLevel: summonerLOL.response.summonerLevel,
    idLOL: summonerLOL.response.id,
    idTFT: summonerTFT.response.id,
    puuidLOL: summonerLOL.response.puuid,
    puuidTFT: summonerTFT.response.puuid,
    leagueTFT: summonerLeagueTFT.response,
    leagueLOL: summonerLeagueLOL.response,
    masteryLOL: [
      masteryLOL.response[0],
      masteryLOL.response[1],
      masteryLOL.response[2],
    ],
  };

  await dbConn
    .promise()
    .query(`UPDATE usuarios SET riot_api=? WHERE id_usuario = ?`, [
      JSON.stringify(data),
      idUsuario,
    ]);
  return data;
};

// get enfrentamientos TFT pendientes de jugar
Jugador.getEnfrentamientosTFT = async function (idTorneo, idUsuario) {
  const enfrentamientos = await UsuarioTorneoTFT.getEnfrentamientosTFT(
    idTorneo
  );
  if (enfrentamientos.length === 0) {
    throw new Error("El jugador no tiene enfrentamientos pendientes");
  }
  const usuario = await Usuario.findById(idUsuario);
  if (!usuario) throw new Error("El usuario no existe");
  const promises = [];
  return new Promise((resolve, reject) => {
    const listaEnfrentamientos = [];
    if (!enfrentamientos)
      reject(
        new Error("El jugador no tiene enfrentamientos pendientes").toString()
      );
    // Recorremos cada enfrentamiento
    enfrentamientos.forEach((element) => {
      const players = JSON.parse(element.json_data);
      // Recorremos la list de jugadores para verificar que el jugador tiene un enfrentamiento pendiente
      for (let i = 0; i < players.players.length; i++) {
        if (
          players.players[i].nombre_invocador === usuario[0].nombre_invocador
        ) {
          element.json_data = players;
          listaEnfrentamientos.push(element);
          break;
        }
      }
    });
    Promise.all(promises).then(() => resolve(listaEnfrentamientos));
  });
};

Jugador.registerTFTMatch = async function (idUsuario, idEnfrentamiento) {
  const enfrentamiento = await EnfrentamientoTft.findById(idEnfrentamiento);
  if (!enfrentamiento) throw new Error("El enfrentamiento no existe");
  const usuario = await Usuario.findById(idUsuario);
  if (!usuario) throw new Error("El usuario no existe");
  if (usuario[0].id_usuario !== enfrentamiento.json_data.captain.id_usuario)
    throw new Error("El usuario no es capitán del enfrentamiento");
  const idTorneo = enfrentamiento.id_torneo;
  const torneo = await Torneos.getById(idTorneo);
  if (torneo.id_estado !== 2) throw new Error("El torneo no está en progreso.");
  if (enfrentamiento.id_riot_match)
    throw new Error("El enfrentamiento ya está jugado");
  usuario[0].riot_api = JSON.parse(usuario[0].riot_api);
  const matchList = await tftApi.Match.listWithDetails(
    usuario[0].riot_api.puuidTFT,
    "americas"
  );
  let matchFound = null;
  // compare participantes
  const enfrentamientoJson = { ...enfrentamiento.json_data };

  matchList.forEach((match) => {
    const matchIds = match.metadata.participants;
    const enfrentamientoIds = enfrentamiento.json_data.players.map(
      (participante) => {
        return participante.riot_api.puuidTFT;
      }
    );
    // order arrays
    matchIds.sort();
    enfrentamientoIds.sort();
    // see if match ids are the same
    if (JSON.stringify(matchIds) === JSON.stringify(enfrentamientoIds)) {
      if (!matchFound) {
        enfrentamiento.id_riot_match = match.metadata.match_id;
        enfrentamiento.fecha_jugada = new Date(match.info.game_datetime);
        matchFound = match;
      }
    }
  });
  // console.log(enfrentamiento);
  EnfrentamientoTft.update(idEnfrentamiento, enfrentamiento, torneo);
  // Codigo de hoy
  // console.log(enfrentamiento.json_data.players);
  enfrentamientoJson.players.sort((a, b) => {
    return a.riot_api.puuidTFT - b.riot_api.puuidTFT;
  });
  matchFound.info.participants.sort((a, b) => {
    return a.puuid - b.puuid;
  });
  for (let i = 0; i < enfrentamientoJson.players.length; i++) {
    await UsuarioTorneoTFT.update(
      idTorneo,
      enfrentamientoJson.players[i].id_usuario,
      matchFound.info.participants[i]
    );
  }
  const enfrentamientosSinJugar =
    await EnfrentamientoTft.getEnfrentamientosSinJugar(idTorneo);

  if (enfrentamientosSinJugar.length === 0) {
    await UsuarioTorneoTFT.eliminarJugadores(torneo);
  }

  // termina codigo de hoy
  return matchFound;
};

module.exports = Jugador;
