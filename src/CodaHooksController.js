var express = require("express");
var helpers = require("./helpers");
var router = express.Router();

router.get("/addGroceryElement/" + process.env.HOOK_CODE, function(req, res) {
    if (req.query.name) {
        //on doit enlever le texte excedentaire que l'assistant ajoute parfois.
        var toAdd = req.query.name;
        toAdd = toAdd
            .replace(" des ", "")
            .replace(" du ", "")
            .replace(" un ", "")
            .replace(" a", "")
            .replace(" la", "")
            .replace(" ma", "");
        toAdd = helpers.capitalize(toAdd, true);
        //idéalement, je devrais faire linker...
        helpers.addGroceryElement(toAdd).then(function() {
            console.log("added new grocery element: " + toAdd);
            res.send("test de Hook!: " + JSON.stringify(req.query));
        });
    } else {
        res.status(500).send("you have to specify a name");
    }
});

module.exports = router;