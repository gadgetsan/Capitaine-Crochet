var express = require("express");
var helpers = require("./helpers");
var LastFM = require("./LastFMapi");
var SQL = require("./Postgresql");
var router = express.Router();

//API pour availability: JUSTWATCH (GoWatchit)

router.get("/addGroceryElement/" + process.env.HOOK_CODE, function (req, res) {
  if (req.query.name) {
    //on doit enlever le texte excedentaire que l'assistant ajoute parfois.
    var toAdd = req.query.name;
    toAdd = toAdd
      .toLowerCase()
      .replace(" des ", " ")
      .replace(" du ", " ")
      .replace(" un ", " ")
      .replace(" a ", " ")
      .replace(" à ", " ")
      .replace(" la ", " ")
      .replace(" ma ", " ");
    toAdd = helpers.capitalize(toAdd, true);
    //idéalement, je devrais faire linker...
    helpers.addGroceryElement(toAdd).then(function () {
      console.log("added new grocery element: " + toAdd);
      res.send("test de Hook!: " + JSON.stringify(req.query));
    });
  } else {
    res.status(500).send("you have to specify a name");
  }
});

router.get("/test", function (req, res) {
  helpers.getshowImage().then((updatedGames) => {
    res.send("TEST");
  });
});

router.get("/fetchMediaMeta/" + process.env.HOOK_CODE, function (req, res) {
  Promise.all([helpers.addPosterToMovies(), helpers.addCoverToGames()]).then(
    (result) => {
      var output = "";
      output +=
        "<strong>Updated Movies: </strong><br/>" + result[0].join("<br/>");
      output += "<br/>";
      output +=
        "<strong>Updated Games:  </strong><br/>" + result[1].join("<br/>");
      res.send(output);
    },
    function (err) {
      res.status(500).send("ERROR: " + err.message);
    }
  );
});

var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
router.post("/addLink/" + process.env.HOOK_CODE, jsonParser, function (
  req,
  res
) {
  console.dir(req.body);
  if (req.query.url) {
    //idéalement, je devrais faire linker...
    helpers.addLink(req.query.url).then(function () {
      console.log("added new url: " + req.query.url);
      res.send("added new url: " + req.query.url);
    });
  } else {
    res.status(500).send("you have to specify an url");
  }
});
router.get("/fetchLastFMdata/" + process.env.HOOK_CODE, jsonParser, function (
  req,
  res
) {
  var dateFetched = new Date();
  SQL.getLastUnfetchedDate()
    .then((dateToFetch) => {
      dateFetched = dateToFetch;
      return LastFM.fetchDataForDay(new Date(dateFetched));
    })
    .then((result) => {
      var played = helpers.toTable(result.weeklytrackchart.track, [
        (row) => row.name,
        (row) => row.artist["#text"],
        (row) => row.playcount
      ]);
      return SQL.getSongsId(played);
      //res.send("hello: " + helpers.toHTMLTable(played));
    })
    .then((result) => {
      return SQL.savePlayCounts(result, new Date(dateFetched));
    })
    .then(() => {
      return SQL.markAsFetched(dateFetched);
    })
    .then(() => {
      res.send("Fetched data for : " + dateFetched);
    })

    .catch((e) => {
      res.status(500).send("ERROR: " + e);
    });
});

module.exports = router;
