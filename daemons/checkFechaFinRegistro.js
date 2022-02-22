const dbConn = require("../config/database");

module.exports = function () {
  console.log("Ejecutando daemon de chequeo de fecha fin de registro");
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
            console.log(
              "Torneo " +
                row.id_torneo +
                " ha cambiado de estado a Confirmacion."
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
