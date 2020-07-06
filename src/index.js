var http = require("http");

//create a server object:
http.createServer(function(req, res) {
    res.write("HOOK!!"); //write a response to the client
    res.end(); //end the response
}).listen(process.env.PORT); //the server object listens on port 8080
