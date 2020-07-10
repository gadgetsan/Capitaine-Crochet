var express = require("express");
var codaCtrl = require("./CodaHooksController");

//https://github.com/parker-codes/coda-js/issues/1

var app = express();

//const server = http.createServer();
//server.on("request", async (req, res) => {
/*
    const firstDoc = docs[0];
    const firstDocTables = await firstDoc.listTables();
    console.log(firstDocTables);

    const columns = await firstDocTables[0].listColumns();
    console.log(columns.map(column => column.name)); // list column names

    const table = docs.getTable("grid-pvL-AWKXM8"); // insert/inject table name or ID here
    const rows = await table.listRows({
        useColumnNames: true // param to display column names rather than key
    });
    const firstRow = rows[0];
    console.log(firstRow.values); // column/value pairs
    console.log(firstRow.listValues()); // each column is object with column and value properties

    //const controls = await coda.listControls("some-doc-ID");
    // or
    const controls = await firstDoc.listControls();
    */
//res.write("HOOK!!"); //write a response to the client
//return res.end(); //end the response
//});
//create a server object:
//server.listen(process.env.PORT); //the server object listens on port 8080

app.get("/", function(req, res) {
  res.send("Hello World!");
});

app.use("/coda", codaCtrl);

app.listen(5000);
