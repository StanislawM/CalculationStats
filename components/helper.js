const mongo = require("mongodb");
const fs = require("fs");
const colors = require('colors');
const MongoClient = mongo.MongoClient;

const connectUrl = JSON.parse(fs.readFileSync("../connect.json")).urlConnectDev;
const dbName = JSON.parse(fs.readFileSync("../connect.json")).dbName;

const matchSlug = "25-07-2022-cincinnati-reds-miami-marlins";

function generateCommands() {
    MongoClient.connect(connectUrl, {
        useUnifiedTopology: true
    }, (err, client) => {
        const db = client.db(dbName);
        const collection = db.collection("matches");
        const projection = { _id: 0, "team_ids.id": 1, season_id: 1, sport_id: 1};

        const query = {
            "slug" : `${matchSlug}`
        }

        collection.find(query, {projection: projection}).toArray(function(err, results){
            // высокий приоритет
            console.log(`php artisan team-stat-v2:recalculation:last ${results[0].team_ids[0].id} all 10 ${results[0].sport_id}`.green);
            console.log(`php artisan team-stat-v2:recalculation:last ${results[0].team_ids[1].id} all 10 ${results[0].sport_id}`.green);
            console.log(`php artisan team-stat-v2:h2h:recalculate:match ${matchSlug} ${results[0].sport_id}`.green);
            // низкий приоритет
            console.log(`php artisan team-stat-v2:recalculation:season ${results[0].team_ids[0].id} ${results[0].season_id} ${results[0].sport_id}`.green);
            console.log(`php artisan team-stat-v2:recalculation:season ${results[0].team_ids[1].id} ${results[0].season_id} ${results[0].sport_id}`.green);
            client.close();
        });
    })
}

generateCommands()