var helpers = require("./helpers");
class Habitica {
  static async addTask(task) {
    var options = {
      host: "habitica.com",
      path: "/api/v3/tasks/user",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client": process.env.HABITICA_USER_ID + "_CapitaineCrochetDev",
        "x-api-user": process.env.HABITICA_USER_ID,
        "x-api-key": process.env.HABITICA_API_TOKEN
      }
    };
    var type = "todo";
    if (task.recurring) {
      type = "daily";
    }
    var body = {
      text: task.name,
      type: type
    };

    try {
      // console.log("starting Request");
      var rawResponse = await helpers.requestAsync(
        options,
        JSON.stringify(body)
      );
      //console.log(rawResponse);
      var response = JSON.parse(rawResponse);
      return response.data;
    } catch (e) {
      console.error("Error while adding Habitica Task: " + e.message);
    }
  }

  static async updateTask(task) {
    var options = {
      host: "habitica.com",
      path: "/api/v3/tasks/" + task.habiticaId,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-client": process.env.HABITICA_USER_ID + "_CapitaineCrochetDev",
        "x-api-user": process.env.HABITICA_USER_ID,
        "x-api-key": process.env.HABITICA_API_TOKEN
      }
    };
    var body = {
      text: task.name
    };

    if (task.done) {
      options = {
        host: "habitica.com",
        path: "/api/v3/tasks/" + task.habiticaId + "/score/up",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client": process.env.HABITICA_USER_ID + "_CapitaineCrochetDev",
          "x-api-user": process.env.HABITICA_USER_ID,
          "x-api-key": process.env.HABITICA_API_TOKEN
        }
      };
      body = {
        up: true
      };
    }

    try {
      // console.log("starting Request");
      var rawResponse = await helpers.requestAsync(
        options,
        JSON.stringify(body)
      );
      //console.log(rawResponse);
      var response = JSON.parse(rawResponse);
      return response.data;
    } catch (e) {
      console.error("Error while updating Habitica Task: " + e.message);
    }
  }
}

module.exports = Habitica;
