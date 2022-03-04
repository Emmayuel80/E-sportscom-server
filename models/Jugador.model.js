const BitacoraTorneo = require("./Bitacora_torneo.model");
const Torneos = require("./Torneos.model");
const UsuarioTorneoTFT = require("./Usuario_torneo_TFT.model");
const Usuario = require("./Usuario.model");
const Jugador = {};
const dbConn = require("../config/database");
const Equipos = require("./Equipos.model");
const UsuarioEquipo = require("./Usuario_equipo.model");

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
      " select t.* from torneos as t where t.id_estado <=3 and t.id_torneo in (select et.id_torneo from equipo_torneo as et, equipos as e, usuario_equipo as ue, usuarios as u where u.id_usuario=? and u.id_usuario=ue.id_usuario and ue.id_equipo=e.id_equipo and e.id_equipo=et.id_equipo);",
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
  // check if the team name is already taken ?
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
  if (fields.length <= 0) throw new Error("El jugador no tiene equipos");
  return fields;
};

module.exports = Jugador;
