module.exports = function (data) {
  if (typeof "" === typeof data.fecha_fin_registro) {
    data.fecha_fin_registro = new Date(data.fecha_fin_registro);
  }
  if (typeof "" === typeof data.fecha_inicio) {
    data.fecha_inicio = new Date(data.fecha_inicio);
  }
  // check if the tournament is in the future
  if (data.fecha_inicio < new Date()) {
    throw new Error("La fecha de inicio no puede ser menor a la fecha actual");
  }
  // check if the tournament is in the future
  if (data.fecha_inicio < data.fecha_fin_registro) {
    throw new Error(
      "La fecha de inicio no puede ser menor a la fecha de fin de registro"
    );
  }
  // check if the tournament is in the future
  if (data.fecha_fin_registro < new Date()) {
    throw new Error(
      "La fecha de fin de registro no puede ser menor a la fecha actual"
    );
  }
  return data;
};
