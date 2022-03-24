process.env.LEAGUE_API_PLATFORM_ID = "la1";
const TftApi = require("twisted").TftApi;
const leagueJs = new TftApi({
  /**
   * If api response is 429 (rate limits) try reattempt after needed time (default true)
   */
  rateLimitRetry: true,
  /**
   * Number of time to retry after rate limit response (default 1)
   */
  rateLimitRetryAttempts: 1,
  /**
   * Concurrency calls to riot (default infinity)
   * Concurrency per method (example: summoner api, match api, etc)
   */
  concurrency: undefined,
  /**
   * Riot games api key
   */
  key: process.env.TFT_API_KEY,
  /**
   * Debug methods
   */
  debug: {
    /**
     * Log methods execution time (default false)
     */
    logTime: false,
    /**
     * Log urls (default false)
     */
    logUrls: false,
  },
});

module.exports = leagueJs;
