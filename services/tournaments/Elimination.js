const Elimination = function (tournament) {
  this.teams = tournament.teams;
  this.id = tournament.id;
  this.round = this.teams.length / 2;

  /* eslint-disable */
  /**
   * Starts the tournament.
   */
  this.startEvent = function () {
    // Need an even number of teams
    if (this.teams.length % 2 !== 0) {
      console.error(
        `Elimination tournaments require an even number of teams, and there are currently ${this.teams.length} teams enrolled on tournament ${tournament.id}`
      );
      return;
    }

    // Need at least 2 teams per round
    if (this.teams.length < 2) {
      console.error(
        `Elimination tournaments require at least 2 teams per round, and there are currently ${this.teams.length} teams enrolled on tournament ${tournament.id}`
      );
      return;
    }
    console.log("Creando enfrentamientos", this.teams.length / 2);
    this.matches = [];
    for (let i = 0; i < this.teams.length / 2; i++) {
      let team1 = {};
      let team2 = {};
      if (i === 0) {
        team1 = this.teams[i];
        team2 = this.teams[i + 1];
      } else {
        team1 = this.teams[i * 2];
        team2 = this.teams[i * 2 + 1];
      }
      let match = {
        team1: team1,
        team2: team2,
        winner: null,
        round: this.teams.length / 2,
      };
      this.matches.push(match);
    }
  };
};

// TODO: Pensar si la actualizacion de torneos afecta algo mas
module.exports = Elimination;
