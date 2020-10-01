const { Pool } = require("pg");
class Postgresql {
  static async getSongsId(songsArray) {
    if (songsArray.length === 0) {
      return Promise.resolve([]);
    }
    var mappedData = [];
    songsArray.forEach((s) => {
      if (mappedData[s[1]] === undefined) {
        mappedData[s[1]] = [];
      }
      mappedData[s[1]][s[0]] = s;
    });
    const pool = new Pool({
      connectionString: process.env.SQL_STRING,
      max: 4,
      idleTimeoutMillis: 5000
    });
    const client = await pool.connect();
    var insertQuery = "INSERT INTO Songs(name, artist) VALUES";
    var insertValues = [];
    var insertIndex = 1;
    songsArray.forEach((song) => {
      insertQuery += "($" + insertIndex + ", $" + (insertIndex + 1) + "),";
      insertValues[insertIndex - 1] = song[0];
      insertValues[insertIndex] = song[1];
      insertIndex += 2;
    });
    insertQuery = insertQuery.slice(0, -1);
    insertQuery += " ON CONFLICT DO NOTHING;";
    //console.log(insertQuery);

    var selectQuery = "SELECT * FROM Songs WHERE ";
    var selectValues = [];
    var selectIndex = 1;
    songsArray.forEach((song) => {
      selectQuery +=
        "(name=$" + selectIndex + " AND artist=$" + (selectIndex + 1) + ") OR ";
      selectValues[selectIndex - 1] = song[0];
      selectValues[selectIndex] = song[1];
      selectIndex += 2;
    });
    selectQuery = selectQuery.slice(0, -4);
    //console.log(query);

    return await client
      .query(insertQuery, insertValues)
      .then(() => client.query(selectQuery, selectValues))
      .then((res) => {
        //console.log("result: ");
        //console.log(res.rows);
        return res.rows;
      })
      .then((result) => {
        client.release();
        //on va ajouter le playcount
        result = result.map((r) => {
          r.playcount = mappedData[r.artist][r.name][2];
          return r;
        });
        return result;
      });
  }

  static async savePlayCounts(infoWithId, date) {
    if (infoWithId.length === 0) {
      return Promise.resolve([]);
    }
    const pool = new Pool({
      connectionString: process.env.SQL_STRING,
      max: 4,
      idleTimeoutMillis: 5000
    });
    const client = await pool.connect();
    var upsertQuery =
      "INSERT INTO daily_playcount(song, day, playcount) VALUES";
    var insertValues = [];
    var insertIndex = 1;
    infoWithId.forEach((song) => {
      upsertQuery +=
        "($" +
        insertIndex +
        ", $" +
        (insertIndex + 1) +
        ", $" +
        (insertIndex + 2) +
        "),";
      insertValues[insertIndex - 1] = song.id;
      insertValues[insertIndex] = date;
      insertValues[insertIndex + 1] = song.playcount;
      insertIndex += 3;
    });
    upsertQuery = upsertQuery.slice(0, -1);
    upsertQuery +=
      " ON CONFLICT ON CONSTRAINT daily_playcount_unique DO UPDATE SET playcount=excluded.playcount;";
    //console.log(upsertQuery);
    return await client
      .query(upsertQuery, insertValues)
      .then((res) => {
        //console.log("result: ");
        //console.log(res.rows);
        return res.row;
      })
      .then((result) => {
        client.release();
        return result;
      });
  }

  static async getLastUnfetchedDate() {
    const pool = new Pool({
      connectionString: process.env.SQL_STRING,
      max: 4,
      idleTimeoutMillis: 5000
    });
    const client = await pool.connect();
    var query = "SELECT * FROM datedata ORDER BY date";
    return await client
      .query(query)
      .then((result) => {
        //console.dir(result);
        var date;
        if (result.rows.length === 0) {
          date = new Date();
        } else {
          date = new Date(result.rows[0].date);
        }
        date.setDate(date.getDate() - 1);
        date.setHours(0, 0, 0, 0);
        return date;
      })
      .then((result) => {
        client.release();
        return result;
      });
  }

  static async markAsFetched(date) {
    const pool = new Pool({
      connectionString: process.env.SQL_STRING,
      max: 4,
      idleTimeoutMillis: 5000
    });
    const client = await pool.connect();
    var query = "INSERT INTO datedata(date, gotfinalplaycount) VALUES($1, $2);";
    return await client.query(query, [date, true]).then(() => {
      client.release();
      return;
    });
  }
}

module.exports = Postgresql;
