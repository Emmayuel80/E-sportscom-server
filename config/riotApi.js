process.env.LEAGUE_API_PLATFORM_ID = "la1";
const LeagueJS = require("leaguejs");
const leagueJs = new LeagueJS(process.env.LEAGUE_API_KEY);

module.exports = leagueJs;
