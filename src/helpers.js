const { Coda } = require("coda-js");
const https = require("https");

exports.requestAsync = async function(options, body = "") {
  return new Promise((resolve, reject) => {
    //console.dir(options);
    var post_req = https.request(options, res => {
      res.setEncoding("utf8");
      res.on("data", chunk => {
        resolve(chunk);
      });
      res.on("error", err => {
        reject(err);
      });
    });
    post_req.write(body);
    post_req.end();
  });
};

exports.formatDate = function(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear(),
    hours = d.getHours(),
    minutes = d.getMinutes();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-") + ", " + hours + ":" + minutes;
};

exports.addGroceryElement = async function(elementName) {
  var coda = new Coda(process.env.CODA_KEY);
  var d = new Date();

  const doc = await coda.getDoc(process.env.MEAL_PLANNER_DOC_ID);
  const table = await doc.getTable(process.env.LISTE_EPICERIE_TABLE_ID);
  //creating object to add
  var toAdd = {};
  toAdd[process.env.LISTE_EPICERIE_NAME_COLUMN] = elementName;
  toAdd[process.env.LISTE_EPICERIE_ADDED_COLUMN] = exports.formatDate(d);
  await table.insertRows([toAdd]);
};

exports.capitalize = (str, lower = false) =>
  (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match =>
    match.toUpperCase()
  );

async function getMedias() {
  try {
    var coda = await new Coda(process.env.CODA_KEY);
    const doc = await coda.getDoc(process.env.HOME_DOC_ID);
    const table = await doc.getTable(process.env.MEDIA_TABLE_ID);
    const rows = await table.listRows({ useColumnNames: false });
    //console.log("Fetched medias from Coda");
    //console.log(JSON.stringify(rows));
    return rows;
  } catch (e) {
    console.error("Error while fetching Medias: " + e.message);
  }
}

async function getMovies() {
  var medias = await getMedias();
  var movies = [];
  //console.log("retrieved " + medias.length + " medias");

  //on va filtrer les medias pour avoir juste les films
  for (var i in medias) {
    var media = medias[i];
    //console.log(JSON.stringify(media));
    if (media.values[process.env.MEDIA_TYPE_COLUMN].search("Movie") !== -1) {
      movies.push(media);
    }
  }
  return movies;
}

async function getGames() {
  var medias = await getMedias();
  var games = [];
  //console.log("retrieved " + medias.length + " medias");

  //on va filtrer les medias pour avoir juste les films
  for (var i in medias) {
    var media = medias[i];
    //console.log(JSON.stringify(media));
    if (media.values[process.env.MEDIA_TYPE_COLUMN].search("Game") !== -1) {
      games.push(media);
    }
  }
  return games;
}

async function getShows() {
  var medias = await getMedias();
  var movies = [];
  //console.log("retrieved " + medias.length + " medias");

  //on va filtrer les medias pour avoir juste les films
  for (var i in medias) {
    var media = medias[i];
    //console.log(JSON.stringify(media));
    if (media.values[process.env.MEDIA_TYPE_COLUMN].search("TV Show") !== -1) {
      movies.push(media);
    }
  }
  return movies;
}
async function getMovieMetaData(movieName) {
  try {
    var options = {
      host: "movie-database-imdb-alternative.p.rapidapi.com",
      path: "/?page=1&r=json&s=" + encodeURI(movieName),
      method: "GET",
      headers: {
        "x-rapidapi-host": "movie-database-imdb-alternative.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPID_API_KEY
      }
    };
    // console.log("starting Request");
    var rawResponse = await exports.requestAsync(options);
    //console.log("Request DONE");
    //console.log(rawResponse);
    var imdbResponse = JSON.parse(rawResponse);
    if (imdbResponse["Search"] !== undefined) {
      var movieMeta = imdbResponse["Search"][0];
      return movieMeta;
    } else {
      return [];
    }
  } catch (e) {
    console.error("Error while fetching Movies Metadata: " + e.message);
  }
}

var getGameCoverUrl = async function(gameName) {
  try {
    var options_games = {
      host: "api-v3.igdb.com",
      path: "/games",
      method: "POST",
      headers: {
        "user-key": process.env.IGDB_KEY
      }
    };
    var options_covers = {
      host: "api-v3.igdb.com",
      path: "/covers",
      method: "POST",
      headers: {
        "user-key": process.env.IGDB_KEY
      }
    };
    //console.log("starting ID Request");
    var rawIds = await exports.requestAsync(
      options_games,
      'fields cover; search "' + gameName + '"; fields name; limit 1;'
    );
    var ids = JSON.parse(rawIds);
    //console.dir(ids[0].cover);
    //console.log("fields image_id; where id = " + ids[0].cover + ";");

    var rawCoverData = await exports.requestAsync(
      options_covers,
      "fields *; where id = " + ids[0].cover + ";"
    );
    //console.log("Cover Request DONE");
    var coverData = JSON.parse(rawCoverData);
    return (
      "https://images.igdb.com/igdb/image/upload/t_cover_big/" +
      coverData[0].image_id +
      ".jpg"
    );
  } catch (e) {
    console.error("Error while fetching Game Cover: " + e.message);
  }
};

exports.getshowImage = async function(showName) {
  try {
    var options_login = {
      host: "api.thetvdb.com",
      path: "/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    };
    var options = {
      host: "api.thetvdb.com",
      path: "/search/series",
      method: "GET",
      headers: {
        "user-key": process.env.IGDB_KEY
      }
    };
    //console.log("starting ID Request");
    var rawToken = await exports.requestAsync(
      options_login,
      '{ "apikey": "' +
        process.env.TVDB_APIKey +
        '", "userkey": "' +
        process.env.TVDB_UserKey +
        '", "username": "' +
        process.env.TVDB_Username +
        '"}'
    );
    var token = JSON.parse(rawToken);
    console.dir(token);
    //console.log("fields image_id; where id = " + ids[0].cover + ";");
    /*
    var rawCoverData = await exports.requestAsync(
      options_covers,
      "fields *; where id = " + ids[0].cover + ";"
    );
    //console.log("Cover Request DONE");
    var coverData = JSON.parse(rawCoverData);
    return (
      "https://images.igdb.com/igdb/image/upload/t_cover_big/" +
      coverData[0].image_id +
      ".jpg"
    );
    */
  } catch (e) {
    console.error("Error while fetching Game Cover: " + e.message);
  }
};

exports.addPosterToMovies = async function() {
  var movies = await getMovies();
  var updatedMovies = [];

  for (var i in movies) {
    var movie = movies[i].values;
    //console.log("Movie Name: " + movie[process.env.MEDIA_NAME_COLUMN]);
    if (movie[process.env.MEDIA_IMAGE_URL_COLUMN] === "") {
      var movieMeta = await getMovieMetaData(
        movie[process.env.MEDIA_NAME_COLUMN]
      );
      console.log(
        "Updating Poster for Movie " +
          movie[process.env.MEDIA_NAME_COLUMN] +
          " with " +
          movieMeta["Poster"]
      );
      updatedMovies.push(movie[process.env.MEDIA_NAME_COLUMN]);
      var updateObj = {};
      updateObj[process.env.MEDIA_IMAGE_URL_COLUMN] = movieMeta["Poster"];
      await movies[i].update(updateObj);
    }
  }
  return updatedMovies;
};

exports.addCoverToGames = async function() {
  var games = await getGames();
  var updatedGames = [];

  for (var i in games) {
    var game = games[i].values;
    //console.log("Game Name: " + game[process.env.MEDIA_NAME_COLUMN]);
    if (game[process.env.MEDIA_IMAGE_URL_COLUMN] === "") {
      var gameCover = await getGameCoverUrl(
        game[process.env.MEDIA_NAME_COLUMN]
      );
      console.log(
        "Updating Cover for Game " +
          game[process.env.MEDIA_NAME_COLUMN] +
          " with " +
          gameCover
      );
      updatedGames.push(game[process.env.MEDIA_NAME_COLUMN]);
      var updateObj = {};
      updateObj[process.env.MEDIA_IMAGE_URL_COLUMN] = gameCover;
      await games[i].update(updateObj);
    }
  }
  return updatedGames;
};
