const got = require("got");

class LastFMapi {
  static async fetchDataForDay(day) {
    var from =
      Math.floor(new Date(day).getTime() / (24 * 60 * 60 * 1000)) *
        (24 * 60 * 60) +
      4 * 60 * 60;
    var to =
      Math.floor(new Date(day).getTime() / (24 * 60 * 60 * 1000)) *
        (24 * 60 * 60) +
      28 * 60 * 60;
    return got("http://ws.audioscrobbler.com/2.0/", {
      searchParams: {
        api_key: process.env.LAST_FM_KEY,
        format: "json",
        from: from,
        to: to,
        method: "user.getWeeklyTrackChart",
        user: "gadgetsan"
      },
      responseType: "json"
    })
      .then((response) => {
        //console.log(response.body);
        return response.body;
      })
      .catch((error) => {
        //console.log("ERROR: " + error);
        return error;
      });
  }
}

module.exports = LastFMapi;
