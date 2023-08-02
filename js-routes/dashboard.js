var express = require('express');
var app = express();

app.use(express.json());

app.get("/getDashboard", (req, resp) => {
    const username = req.query.username;
    const travelDatas = JSON.parse(readFileSync("./jsons/travelDatas.json", {encoding: "utf-8"}));
    console.log(username);
    if(!(username in travelDatas)){
      resp.setHeader("Content-Type", "application/json");
      resp.end(JSON.stringify({totalDistanceTraveled:0, totalSuddenBrakes:0, totalRearImpacts:0}));
      return;
    }
    let data = {};
    data["totalDistanceTraveled"] = travelDatas[username].totalDistanceTraveled;
    delete travelDatas;
    const accidentLocations = JSON.parse(readFileSync("./jsons/dangerLocations.json", {encoding: "utf-8"}));
    let countBrakes = 0;
    let countRearImpacts = 0;
    for(i in accidentLocations){
      if(accidentLocations[i].time < (Date.now() - 1000*60*60*24 * 3)){
        continue;
      }
      if(accidentLocations[i].user != username){
        continue;
      }
      if(accidentLocations[i].type == "brake"){
        countBrakes++;
      }else if(accidentLocations[i].type == "rear impact"){
        countRearImpacts++;
      }
    }
    data["totalSuddenBrakes"] = countBrakes;
    data["totalRearImpacts"] = countRearImpacts;
    delete accidentLocations;
    resp.setHeader("Content-Type", "application/json");
    resp.end(JSON.stringify(data));
  });  

module.exports = app;