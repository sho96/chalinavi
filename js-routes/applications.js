var express = require('express');
var app = express();

app.use(express.json());

//navigation page
app.get("/apps/navigation", (req, resp) => {
    const activeTokens = JSON.parse(readFileSync("./jsons/activeTokens.json", {encoding: "utf-8"}));
    console.log(req.query.token);
    if(!(req.query.token in activeTokens)){
      resp.redirect("/login");
      console.log("token doesn't exist")
      return;
    }
    if(activeTokens[req.query.token]["due"] <= Date.now()){
      delete activeTokens[req.query.token];
      writeFileSync("./jsons/activeTokens.json", JSON.stringify(activeTokens));
      resp.redirect("/login");
      console.log("token expired");
      return;
    }
    const lang = req.query["lang"];
    resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    resp.setHeader("Pragma", "no-cache");
    resp.setHeader("Expires", "0");
    if(lang == "en"){
      resp.status(200).send(readFileSync("./htmls-en/apps/navigation.html", {encoding : "utf-8"}));
    }else if(lang == "ja"){
      resp.status(200).send(readFileSync("./htmls/apps/navigation.html", {encoding : "utf-8"}));
    }else{
      resp.status(200).send(readFileSync("./htmls-en/apps/navigation.html", {encoding : "utf-8"}));
    }
  });
  app.post("/apps/navigation/sendData", (req, resp) => {
    const type = req.body.type;
    const location = req.body.location;
    const username = req.body.username;
  
    console.log(`received accident: ${type}`);
    
    const dangerLocations = JSON.parse(readFileSync("./jsons/dangerLocations.json"));
    dangerLocations[dangerLocations.length] = {type: type, time: Date.now(), location: {lat: location.lat, lon: location.lon}, user: username};
    
    writeFileSync("./jsons/dangerLocations.json", JSON.stringify(dangerLocations));
    resp.status(200).send("recorded");
  });
  app.get("/apps/navigation/getData", (req, resp) => {
    lat = req.query.lat;
    lon = req.query.lon;
  
    console.log(lat); 
    console.log(lon);
  
    const dangerLocations = JSON.parse(readFileSync("./jsons/dangerLocations.json"));
    dataToSend = [];
    for(i in dangerLocations){
      data = dangerLocations[i];
      if(getDistanceOnEarth(lat, lon, data.location.lat, data.location.lon) < 7500){
        dataToSend[dataToSend.length] = data;
      }
    }
    resp.setHeader("Content-Type", "application/json");
    resp.end(JSON.stringify(dataToSend));
  });
  app.post("/apps/navigation/sendVehicleData", (req, resp) => {
    token = req.body.token;
    location = req.body.location;
    direction = req.body.direction;
    speed = req.body.speed;
    type = req.body.type;
    let vehicleDatas = JSON.parse(readFileSync("./jsons/activeVehicles.json", {encoding: "utf-8"}));
    vehicleDatas[token] = {type: type, location: location, direction: direction, speed: speed, time: Date.now()};
    //delete un-updated vehicle datas
    tokens = Object.keys(vehicleDatas);
    picked = getRandomInt(tokens.length)
    if (vehicleDatas[tokens[picked]].time < Date.now()-120000){
      delete vehicleDatas[tokens[picked]];
    }
    writeFileSync("./jsons/activeVehicles.json", JSON.stringify(vehicleDatas));
    resp.status(200).send();
  });
  app.get("/apps/navigation/getVehicleData", (req, resp) => {
    lat = req.query.lat;
    lon = req.query.lon;
  
    const vehicleDatas = JSON.parse(readFileSync("./jsons/activeVehicles.json"));
    dataToSend = {};
    for(token in vehicleDatas){
      data = vehicleDatas[token];
      if(getDistanceOnEarth(lat, lon, data.location.lat, data.location.lon) < 3000){
        dataToSend[token] = data;
      }
    }
    resp.setHeader("Content-Type", "application/json");
    resp.end(JSON.stringify(dataToSend));
  });
  app.post("/apps/navigation/sendSummary", (req, resp) => {
    const traveledDistance = req.body.distanceTraveled;
    const username = req.body.username;
    let travelDatas = JSON.parse(readFileSync("./jsons/travelDatas.json", {encoding: "utf-8"}));
    if(!(username in travelDatas)){
      travelDatas[username] = {totalDistanceTraveled: 0};
    }
    travelDatas[username].totalDistanceTraveled += traveledDistance;
    writeFileSync("./jsons/travelDatas.json", JSON.stringify(travelDatas));
    resp.status(200).send();
  });
  
  //hazard map page
  app.get("/apps/hazardMap", (req, resp) => {
    const activeTokens = JSON.parse(readFileSync("./jsons/activeTokens.json", {encoding: "utf-8"}));
    console.log(req.query.token);
    if(!(req.query.token in activeTokens)){
      resp.redirect("/login");
      console.log("token doesn't exist")
      return;
    }
    if(activeTokens[req.query.token]["due"] <= Date.now()){
      delete activeTokens[req.query.token];3
      writeFileSync("./jsons/activeTokens.json", JSON.stringify(activeTokens));
      resp.redirect("/login");
      console.log("token expired");  
      return;
    }
    const lang = req.query["lang"];
    resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    resp.setHeader("Pragma", "no-cache");
    resp.setHeader("Expires", "0");
    if(lang == "en"){
      resp.status(200).send(readFileSync("./htmls-en/apps/hazardMap.html", {encoding : "utf-8"}));
    }else if(lang == "ja"){
      resp.status(200).send(readFileSync("./htmls/apps/hazardMap.html", {encoding : "utf-8"}));
    }else{
      resp.status(200).send(readFileSync("./htmls-en/apps/hazardMap.html", {encoding : "utf-8"}));
    }
  });
  app.get("/apps/hazardMap/getDangerLocations", (req, resp) => {
    const dangerLocations = JSON.parse(readFileSync("./jsons/dangerLocations.json", {encoding: "utf-8"}));
    resp.setHeader("Content-Type", "application/json");
    resp.end(JSON.stringify(dangerLocations));
  });
  
  //rating page
  app.get("/apps/rate", (req, resp) => {
    const activeTokens = JSON.parse(readFileSync("./jsons/activeTokens.json", {encoding: "utf-8"}));
    console.log(req.query.token);
    if(!(req.query.token in activeTokens)){
      resp.redirect("/login");
      console.log("token doesn't exist")
      return;
    }
    if(activeTokens[req.query.token]["due"] <= Date.now()){
      delete activeTokens[req.query.token];3
      writeFileSync("./jsons/activeTokens.json", JSON.stringify(activeTokens));
      resp.redirect("/login");
      console.log("token expired");  
      return;
    }
    const lang = req.query["lang"];
    resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    resp.setHeader("Pragma", "no-cache");
    resp.setHeader("Expires", "0");
    if(lang == "en"){
      resp.status(200).send(readFileSync("./htmls-en/apps/rate.html", {encoding : "utf-8"}));
    }else if(lang == "ja"){
      resp.status(200).send(readFileSync("./htmls/apps/rate.html", {encoding : "utf-8"}));
    }else{
      resp.status(200).send(readFileSync("./htmls-en/apps/rate.html", {encoding : "utf-8"}));
    }
  });
  app.post("/apps/rate/submitRating", (req, resp) => {
    const goodPoints = req.body.goodPoints;
    const badPoints = req.body.badPoints;
    console.log(goodPoints);
  
    ratings = JSON.parse(readFileSync("./jsons/userRatings.json", {encoding: "utf-8"}));
    console.log(ratings);
    ratings[ratings.length] = {good: goodPoints, bad: badPoints};
    writeFile("./jsons/userRatings.json", JSON.stringify(ratings), err => {if(err) console.log(err)});
    sendEmailMultiple(["maetaka-2022066@edu-g.gsn.ed.jp", "maetaka-2023104@edu-g.gsn.ed.jp"], "rating was sent", `良い点: ${goodPoints}\n改善点: ${badPoints}`);
    resp.status(200).send();
  });  

module.exports = app;