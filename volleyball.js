const mongo = require("mongodb");
const fs = require("fs");
const colors = require("colors");
const prompts = require("prompts");
const MongoClient = mongo.MongoClient;

const connectUrl = JSON.parse(fs.readFileSync("./connect.json")).urlConnectDev;
const dbName = JSON.parse(fs.readFileSync("./connect.json")).dbName;
const listGames = JSON.parse(fs.readFileSync("./metaInfo.json"));
const countMatches = listGames.length;

const teamId = "7511";
const seasonId = "92383";
const lastTen = true;

(async () => {
  const response = await prompts({
    type: "select",
    name: "value",
    message: "Choose your destiny…",
    choices: [
      {
        title: "Update",
        value: "calc",
      },
      {
        title: "Calculate",
        value: "update",
      },
    ],
    initial: 1,
  });

  if (response.value == "calc") {
    findMatches();
  } else {
    gamesPlayed();
    balls();
    ballsInNets();
  }
})();

function findMatches() {
  MongoClient.connect(
    connectUrl,
    {
      useUnifiedTopology: true,
    },
    (err, client) => {
      const db = client.db(dbName);
      const collection = db.collection("matches");

      const projection = {
        _id: 0,
        slug: 1,
        result_scores: 1,
        "teams.id": 1,
        result_score: 1,
      };

      if (lastTen) {
        const query = {
          $and: [
            {
              $or: [
                {
                  "teams.0.id": `${teamId}`,
                },
                {
                  "teams.1.id": `${teamId}`,
                },
              ],
            },
            {
              "status.code": {
                $gt: 99,
              },
            },
            {
              "status.code": {
                $lt: 200,
              },
            },
            {
              is_finished: true,
            },
            {
              hidden: {
                $ne: "true",
              },
            },
            {
              is_canceled: {
                $ne: "true",
              },
            },
          ],
        };

        collection
          .find(query, {
            projection: projection,
          })
          .limit(10)
          .sort("match_date", -1)
          .toArray(function (err, results) {
            fs.writeFileSync("./metaInfo.json", JSON.stringify(results));
            client.close();
          });
      } else {
        const query = {
          $and: [
            {
              $or: [
                {
                  "teams.0.id": `${teamId}`,
                },
                {
                  "teams.1.id": `${teamId}`,
                },
              ],
            },
            {
              season_id: `${seasonId}`,
            },
            {
              "status.code": {
                $gt: 99,
              },
            },
            {
              "status.code": {
                $lt: 200,
              },
            },
            {
              is_finished: true,
            },
            {
              hidden: {
                $ne: "true",
              },
            },
            {
              is_canceled: {
                $ne: "true",
              },
            },
          ],
        };

        collection
          .find(query, {
            projection: projection,
          })
          .toArray(function (err, results) {
            fs.writeFileSync("./metaInfo.json", JSON.stringify(results));
            client.close();
          });
      }
      console.log(`Нахождение матчей 🏐...`.yellow);
    }
  );
}

function gamesPlayed() {
  let overallGame = listGames.length;
  let teamWin = 0;
  let teamLoose = 0;
  let setsFor = 0;
  let setsAgaints = 0;

  listGames.forEach((item) => {
    let teamHome = parseInt(item.result_score.split(":")[0]);
    let teamAway = parseInt(item.result_score.split(":")[1]);
    if (item.teams[0].id == teamId) {
      setsFor += teamHome;
      setsAgaints += teamAway;
      if (teamHome > teamAway) {
        teamWin++;
      } else if (teamHome < teamAway) {
        teamLoose++;
      }
    } else {
      setsFor += teamAway;
      setsAgaints += teamHome;
      if (teamHome < teamAway) {
        teamWin++;
      } else if (teamHome > teamAway) {
        teamLoose++;
      }
    }
  });

  console.log(`Всего матчей: ${overallGame}`.yellow);
  console.log(
    `Победы: ${teamWin} | Выиграно сетов: ${setsFor} | Процент выигранных сетов: ${(
      (setsFor / (setsFor + setsAgaints)) *
      100
    ).toFixed(2)}%`.green
  );
  console.log(
    `Поражения: ${teamLoose} | Проиграно сетов: ${setsAgaints} | Процент проигранных сетов: ${(
      (setsAgaints / (setsFor + setsAgaints)) *
      100
    ).toFixed(2)}%`.red
  );
}

function balls() {
  let pointsFor = 0;
  let pointsAgaints = 0;

  listGames.forEach((item) => {
    if (item.teams[0].id == teamId) {
      for (let key in item.result_scores) {
        if (
          item.result_scores[key].type != "Sets" &&
          item.result_scores[key].type != "FT"
        ) {
          pointsFor += parseInt(item.result_scores[key].value.split(":")[0]);
          pointsAgaints += parseInt(
            item.result_scores[key].value.split(":")[1]
          );
        }
      }
    } else {
      for (let key in item.result_scores) {
        if (
          item.result_scores[key].type != "Sets" &&
          item.result_scores[key].type != "FT"
        ) {
          pointsFor += parseInt(item.result_scores[key].value.split(":")[1]);
          pointsAgaints += parseInt(
            item.result_scores[key].value.split(":")[0]
          );
        }
      }
    }
  });
  console.log(
    `Всего заброшено и пропущено: ${
      pointsFor + pointsAgaints
    } | Среднее за матч: ${((pointsFor + pointsAgaints) / countMatches).toFixed(
      2
    )}`.yellow
  );
  console.log(
    `Забито: ${pointsFor} | Среднее за матч: ${(
      pointsFor / countMatches
    ).toFixed(1)}`.green
  );
  console.log(
    `Пропущено: ${pointsAgaints} | Среднее за матч: ${(
      pointsAgaints / countMatches
    ).toFixed(1)}`.red
  );
}

function ballsInNets() {
  let winFirstGame = 0;
  let loseFirstGame = 0;
  let winSecondGame = 0;
  let loseSecondGame = 0;
  let winThirdGame = 0;
  let loseThirdGame = 0;
  let winFourthGame = 0;
  let loseFourthGame = 0;
  let winFifthGame = 0;
  let loseFifthGame = 0;

  listGames.forEach((item) => {
    if (item.teams[0].id == teamId) {
      for (let key in item.result_scores) {
        switch (item.result_scores[key].type) {
          case "1":
            winFirstGame += parseInt(
              item.result_scores[key].value.split(":")[0]
            );
            loseFirstGame += parseInt(
              item.result_scores[key].value.split(":")[1]
            );
            break;
          case "2":
            winSecondGame += parseInt(
              item.result_scores[key].value.split(":")[0]
            );
            loseSecondGame += parseInt(
              item.result_scores[key].value.split(":")[1]
            );
            break;
          case "3":
            winThirdGame += parseInt(
              item.result_scores[key].value.split(":")[0]
            );
            loseThirdGame += parseInt(
              item.result_scores[key].value.split(":")[1]
            );
            break;
          case "4":
            winFourthGame += parseInt(
              item.result_scores[key].value.split(":")[0]
            );
            loseFourthGame += parseInt(
              item.result_scores[key].value.split(":")[1]
            );
            break;
          case "5":
            winFifthGame += parseInt(
              item.result_scores[key].value.split(":")[0]
            );
            loseFifthGame += parseInt(
              item.result_scores[key].value.split(":")[1]
            );
            break;
          default:
            break;
        }
      }
    } else {
      for (let key in item.result_scores) {
        switch (item.result_scores[key].type) {
          case "1":
            winFirstGame += parseInt(
              item.result_scores[key].value.split(":")[1]
            );
            loseFirstGame += parseInt(
              item.result_scores[key].value.split(":")[0]
            );
            break;
          case "2":
            winSecondGame += parseInt(
              item.result_scores[key].value.split(":")[1]
            );
            loseSecondGame += parseInt(
              item.result_scores[key].value.split(":")[0]
            );
            break;
          case "3":
            winThirdGame += parseInt(
              item.result_scores[key].value.split(":")[1]
            );
            loseThirdGame += parseInt(
              item.result_scores[key].value.split(":")[0]
            );
            break;

          case "4":
            winFourthGame += parseInt(
              item.result_scores[key].value.split(":")[1]
            );
            loseFourthGame += parseInt(
              item.result_scores[key].value.split(":")[0]
            );
            break;
          case "5":
            winFifthGame += parseInt(
              item.result_scores[key].value.split(":")[1]
            );
            loseFifthGame += parseInt(
              item.result_scores[key].value.split(":")[0]
            );
            break;
          default:
            break;
        }
      }
    }
  });
  console.log(
    `Первый сет:\n`,
    colors.green(`Забито: ${winFirstGame}`),
    colors.red(`Пропущено: ${loseFirstGame}`)
  );
  console.log(
    `Второй сет:\n`,
    colors.green(`Забито: ${winSecondGame}`),
    colors.red(`Пропущено: ${loseSecondGame}`)
  );
  console.log(
    `Третий сет:\n`,
    colors.green(`Забито: ${winThirdGame}`),
    colors.red(`Пропущено: ${loseThirdGame}`)
  );
  console.log(
    `Четвертый сет:\n`,
    colors.green(`Забито: ${winFourthGame}`),
    colors.red(`Пропущено: ${loseFourthGame}`)
  );
  console.log(
    `Пятый сет:\n`,
    colors.green(`Забито: ${winFifthGame}`),
    colors.red(`Пропущено: ${loseFifthGame}`)
  );
}
