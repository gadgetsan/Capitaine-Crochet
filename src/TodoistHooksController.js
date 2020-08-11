var express = require("express");
var helpers = require("./helpers");
var Task = require("./Task");
var router = express.Router();

var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();

router.post("/IncomingHook/" + process.env.HOOK_CODE, jsonParser, function (
  req,
  res
) {
  console.log(req.body.event_name);
  res.status(200).send("will be done!");
  if (
    req.body.event_name === "item:added" ||
    req.body.event_name === "item:updated" ||
    req.body.event_name === "item:completed" ||
    req.body.event_name === "item:uncompleted"
  ) {
    var task = new Task();
    task.buildFromTodoist(req.body.event_data).then(function (result) {
      console.log(
        "ADDED OR UDPDATED ITEM '" +
          req.body.event_data.content +
          "' in Todoist (ID#" +
          req.body.event_data.id +
          "), Changes reflected in Habitica and Coda"
      );
    });
  } else {
    console.dir(req.body.event_data);
  }
});

module.exports = router;
