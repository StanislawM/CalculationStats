const fs = require("fs");
const colors = require('colors');
const prompts = require("prompts");
const fetchMatchesList = require("./components/fetchingMatches.js");

const listGames = JSON.parse(fs.readFileSync("./metaInfo.json"));
const countMatches = listGames.length;

const teamId = "22433";

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
        fetchMatchesList.findMatches(teamId)
    } else {
        gamesPlayed()
        goalsScored()
    }
  })();

function gamesPlayed() {
    let teamWin = 0;
    let teamWinHome = 0;
    let teamWinAway = 0;
    let teamLoose = 0;
    let teamLooseHome = 0;
    let teamLooseAway = 0;
    let teamsDraw = 0;

    listGames.forEach(item => {
        let teamHome = parseInt(item.result_score.split(":")[0]);
        let teamAway = parseInt(item.result_score.split(":")[1]);
        if (item.teams[0].id == teamId) {
            if (teamHome > teamAway) {
                teamWin++;
                teamWinHome++;
            } else if (teamHome < teamAway) {
                teamLoose++;
                teamLooseHome++;
            } else if (teamHome === teamAway) {
                teamsDraw++;
            }
        } else {
            if (teamHome < teamAway) {
                teamWin++;
                teamWinAway++;
            } else if (teamHome > teamAway) {
                teamLoose++;
                teamLooseAway++;
            }
        }
    });
    console.log(`Всего матчей: ${countMatches}`.yellow.bold)
    console.log(`Победы: ${teamWin} \n Победы дома: ${teamWinHome} \n Победы в гостях: ${teamWinAway}`.green)
    console.log(`Поражения: ${teamLoose} \n Поражения дома: ${teamLooseHome} \n Поражения в гостях: ${teamLooseAway}`.red)
}

function goalsScored() {
    let teamScoredHome = 0;
    let teamPlayedHome = 0;
    let teamScoredAway = 0;
    let teamPlayedAway = 0;
    let teamMissedHome = 0;
    let teamMissedAway = 0;

    listGames.forEach(item => {
        let teamHome = parseInt(item.result_score.split(":")[0]);
        let teamAway = parseInt(item.result_score.split(":")[1]);
        if (item.teams[0].id == teamId) {
            teamScoredHome+=teamHome;
            teamPlayedHome++;
            teamMissedHome+=teamAway;
        } else {
            teamScoredAway+=teamAway;
            teamPlayedAway++;
            teamMissedAway+=teamHome;
        }
    });
    console.log(`Забито: ${teamScoredHome+teamScoredAway} | Среднее забитых: ${((teamScoredHome+teamScoredAway)/countMatches).toFixed(1)}`.green)
    console.log(`Забито дома: ${teamScoredHome} | Среднее забитых дома: ${(teamScoredHome/teamPlayedHome).toFixed(1)}`.green)
    console.log(`Забито в гостях: ${teamScoredAway} | Среднее забитых в гостях: ${(teamScoredAway/teamPlayedAway).toFixed(1)}`.green)
    console.log(`Пропущено: ${teamMissedHome+teamMissedAway} | Среднее забитых: ${((teamMissedHome+teamMissedAway)/countMatches).toFixed(1)}`.red)
    console.log(`Пропущено дома: ${teamMissedHome} | Среднее пропущенных дома: ${(teamMissedHome/teamPlayedHome).toFixed(1)}`.red)
    console.log(`Пропущено в гостях: ${teamMissedAway} | Среднее пропущенных в гостях: ${(teamMissedAway/teamPlayedAway).toFixed(1)}`.red)
}