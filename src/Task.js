var CodaTask = require("./Coda");
var Habitica = require("./Habitica");
class Task {
  async buildFromTodoist(jsonObject) {
    //console.log(jsonObject);
    this.name = jsonObject.content;
    this.todoistId = jsonObject.id;

    //on commence par voir si c'est recurring parce que si c'est le cas, on va créer un daily au lien d'une habitude
    if (jsonObject.due != null && jsonObject.due.is_recurring != null) {
      this.recurring = true;
    } else {
      this.recurring = false;
    }
    this.done = jsonObject.checked;

    //on va aller voir si l'entrée existe deja dans Coda
    try {
      var codaTask = await CodaTask.getTaskFromTodoistId(this.todoistId);
      this.habiticaId = codaTask["values"][process.env.TASK_HABITICA_ID_COLUMN];
    } catch (e) {
      console.error(e);
    }

    //si elle n'existe pas, ou l'ajoute (et on va la créer dans Habitica)

    if (
      codaTask &&
      codaTask["values"] &&
      codaTask["values"][process.env.TASK_HABITICA_ID_COLUMN]
    ) {
      console.log(
        "Updating Habitica Task #" +
          codaTask["values"][process.env.TASK_HABITICA_ID_COLUMN]
      );
      await Habitica.updateTask(this);
    } else {
      console.log("Creating Habitica Task...");
      var habiticaTask = await Habitica.addTask(this);
      this.habiticaId = habiticaTask.id;
      console.log("Created Habitica Task with Id #" + this.habiticaId);
    }
    if (codaTask) {
      console.log("Updating Coda Task...");
      await CodaTask.updateTask(this);
    } else {
      console.log("Creating Coda Task...");
      await CodaTask.addTask(this);
    }

    //si elle existe, on la met à jour dans Coda et Habitica
  }

  //NOT DONE
  async deleteFromTodoist(id) {
    console.log(jsonObject);
    //on va simplement aller le supprimer dans Coda
  }
}

module.exports = Task;
