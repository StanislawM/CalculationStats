const mongo = require("mongodb");
const fs = require("fs");
const MongoClient = mongo.MongoClient;

const connectUrl = JSON.parse(fs.readFileSync("./connect.json")).urlConnectDev;
const dbName = JSON.parse(fs.readFileSync("./connect.json")).dbName;
const lastTen = true;

function findMatches(teamId) {
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
        console.log(`Нахождение матчей 🔎...`.yellow);
      }
    );
  }

module.exports.findMatches = findMatches;