var Coda = require("coda-js").Coda;

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
