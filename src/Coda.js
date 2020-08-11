const { Coda } = require("coda-js");
var Habitica = require("./Habitica");
class CodaTask {
  static async getTaskFromTodoistId(todoistId) {
    try {
      var coda = await new Coda(process.env.CODA_KEY);
      const doc = await coda.getDoc(process.env.HOME_DOC_ID);
      const table = await doc.getTable(process.env.TASK_TABLE_ID);
      const rows = await table.listRows({
        query: process.env.TASK_TODOIST_ID_COLUMN + ':"' + todoistId + '"'
      });
      return rows[0];
    } catch (e) {
      console.error("Error while fetching coda Task: " + e.message);
      return null;
    }
  }

  static async addTask(task) {
    var coda = new Coda(process.env.CODA_KEY);

    const doc = await coda.getDoc(process.env.HOME_DOC_ID);
    const table = await doc.getTable(process.env.TASK_TABLE_ID);
    //creating object to add

    if (task.todoistId == null) {
      console.error("NEED TO IMPLEMENT TODOIST ADD TASK");
    }
    var status = "Idée 💡";
    if (task.done) {
      status = "Terminé ✔";
    }

    var toAdd = {};
    toAdd[process.env.TASK_NAME_COLUMN] = task.name;
    toAdd[process.env.TASK_TODOIST_ID_COLUMN] = task.todoistId;
    toAdd[process.env.TASK_HABITICA_ID_COLUMN] = task.habiticaId;
    toAdd[process.env.TASK_STATUS_COLUMN] = status;
    await table.insertRows([toAdd]);
    return toAdd;
  }

  static async updateTask(task) {
    var codaTask;
    if (task.todoistId) {
      codaTask = await this.getTaskFromTodoistId(task.todoistId);
    } else {
      console.error("NEED TO IMPLEMENT TODOIST ADD TASK");
    }

    var status = "Idée 💡";
    if (task.done) {
      status = "Terminé ✔";
    }

    var updateObj = {};
    updateObj[process.env.TASK_NAME_COLUMN] = task.name;
    updateObj[process.env.TASK_TODOIST_ID_COLUMN] = task.todoistId;
    updateObj[process.env.TASK_HABITICA_ID_COLUMN] = task.habiticaId;
    updateObj[process.env.TASK_STATUS_COLUMN] = status;
    await codaTask.update(updateObj);
    return codaTask;
  }
}

module.exports = CodaTask;
