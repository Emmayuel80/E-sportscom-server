const RoundRobin = function (tournament) {
  this.size = tournament.size;
  this.players = tournament.players;
  this.id = tournament.id;

  /* eslint-disable */
  /**
   * Starts the tournament.
   */
  this.startEvent = function () {
    // Need at least 4 players
    if (this.players.length < 8) {
      console.error(
        `Round-Robin tournaments require at least 8 players, and there are currently ${this.players.length} players enrolled on tournament ${tournament.id}`
      );
      return;
    }

    this.matches = [];
    if (this.size === 8) {
      for (let i = 0; i < 4; i++) {
        this.matches.push({
          players: this.players,
          captain: this.players[0],
        });
      }
    } else {
      const tournamentDates = [];
      for (let i = 0; i < 4; i++) {
        tournamentDates.push(
          new Date(new Date().setHours(new Date().getHours() + i))
        );
      }
      for (let x = 0; x < 2; x++) {
        let playerAux = [...this.players];
        // randomize playerAux array
        for (let i = playerAux.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [playerAux[i], playerAux[j]] = [playerAux[j], playerAux[i]];
        }
        // TODO: assign match captain
        for (let i = 0; i < this.size / 8; i++) {
          this.matches.push({
            fechaCreacion: x === 0 ? tournamentDates[0] : tournamentDates[2],
            players: playerAux.slice(0, 8),
            captain: playerAux[0],
          });
          this.matches.push({
            fechaCreacion: x === 0 ? tournamentDates[1] : tournamentDates[3],
            players: playerAux.slice(0, 8),
            captain: playerAux[0],
          });
          playerAux.splice(0, 8);
        }
      }
    }
  };
};

// TODO: Pensar si la actualizacion de torneos afecta algo mas
module.exports = RoundRobin;
