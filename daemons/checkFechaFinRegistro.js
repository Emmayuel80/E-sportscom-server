const dbConn = require("../config/database");
const BitacoraTorneo = require("../models/Bitacora_torneo.model");
module.exports = function () {
  console.log("[DAEMON] Ejecutando daemon de chequeo de fecha fin de registro");
  dbConn
    .promise()
    .query(
      "SELECT * FROM torneos WHERE fecha_fin_registro IS NOT NULL AND fecha_fin_registro <= NOW() AND id_estado = 0"
    )
    .then(([fields, rows]) => {
      if (fields.length > 0) {
        fields.forEach(async (row) => {
          try {
            await dbConn
              .promise()
              .query("UPDATE torneos SET id_estado = 1 WHERE id_torneo = ?", [
                row.id_torneo,
              ]);
            // Inserta la creacion en la bitacora
            const newBitacoraTorneo = new BitacoraTorneo({
              id_torneo: row.id_torneo,
              id_usuario: row.id_usuario,
              desc_modificacion:
                "Se terminó la fase de inscripción del torneo: " + row.nombre,
            });
            await BitacoraTorneo.create(newBitacoraTorneo);
            require("../services/sendUpdateTournamentMail")(
              row,
              row.nombre,
              "El torneo cerró su fase de inscripción. <br> El torneo iniciará el " +
                row.fecha_inicio.toLocaleDateString("es-MX")
            );
            console.log(
              "[fecha fin de registro] Torneo " +
                row.id_torneo +
                " ha cambiado de estado a Confirmación."
            );
          } catch (err) {
            console.log(err);
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
