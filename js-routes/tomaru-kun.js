const { readFile, readFileSync, writeFile, writeFileSync} = require("fs");
var nodemailer = require('nodemailer');
var multer = require("multer");
var express = require('express');
var app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./imgs/apps/hazardMap/")
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
})

const upload = multer({storage: storage})

app.use(express.json());

app.get("/apps/navigation-tomaruKun", (req, resp) => {
  const activeTokens = JSON.parse(readFileSync("./jsons/activeTokens.json", {encoding: "utf-8"}));
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
    resp.status(200).send(readFileSync("./htmls-en/apps/navigation-tomaruKun.html", {encoding : "utf-8"}));
  }else if(lang == "ja"){
    resp.status(200).send(readFileSync("./htmls/apps/navigation-tomaruKun.html", {encoding : "utf-8"}));
  }else{
    resp.status(200).send(readFileSync("./htmls-en/apps/navigation-tomaruKun.html", {encoding : "utf-8"}));
  }
});

//----------------------------- unlinked -----------------------------
app.post("/tomaru-kun/unlinked/register", (req, resp) => {
  name = req.body.name;
  password = req.body.password;
  console.log(name);
  console.log(password);
  const queue = JSON.parse(readFileSync("./jsons/tomaruQueue.json", {encoding: "utf-8"}));
  queue[name] = {password: password, time: Date.now(), com: {}};
  writeFileSync("./jsons/tomaruQueue.json", JSON.stringify(queue));
  resp.status(200).send();
});
app.post("/tomaru-kun/unlinked/login", (req, resp) => {
  name = req.body.name;
  password = req.body.password;
  token = req.body.token;
  const queue = JSON.parse(readFileSync("./jsons/tomaruQueue.json", {encoding: "utf-8"}));
  //login failed guard clauses
  if(!queue.hasOwnProperty(name)){
    resp.setHeader("Content-Type", "application/json");
    resp.end(JSON.stringify({"status": "failed"}));
    return;
  }
  if(queue[name].password != password){
    resp.setHeader("Content-Type", "application/json");
    resp.end(JSON.stringify({"status": "failed"}));
    return;
  }
  //login accepted
  queue[name].com["token"] = token;
  resp.setHeader("Content-Type", "application/json");
  resp.end(JSON.stringify({"status": "success"}));
});
app.get("/tomaru-kun/unlinked/getMessage", (req, resp) => {
  name = req.query.name;
  type = req.query.type;
  const queue = JSON.parse(readFileSync("./jsons/tomaruQueue.json", {encoding: "utf-8"}));
  msg = queue[name].com[type];
  delete queue[name].com[type];
  writeFileSync("./jsons/tomaruQueue.json", JSON.stringify(queue));
  //console.log(msg);
  resp.setHeader("Content-Type", "application/json");
  if(msg == null){
    resp.end(JSON.stringify({message: ""}));
    return;
  }
  resp.end(JSON.stringify({message: msg}));
});
app.post("/tomaru-kun/unlinked/setMessage", (req, resp) => {
  content = req.body.message;
  name = req.body.name;
  const queue = JSON.parse(readFileSync("./jsons/tomaruQueue.json", {encoding: "utf-8"}));
  queue[name].com = {
    ...queue[name].com,
    ...content
  }
  writeFileSync("./jsons/tomaruQueue.json", JSON.stringify(queue));
  resp.status(200).send();
});
app.post("/tomaru-kun/unlinked/updateTimestamp", (req, resp) => {
  name = req.body.name;
  const queue = JSON.parse(readFileSync("./jsons/tomaruQueue.json", {encoding: "utf-8"}));
  queue[name].time = Date.now();
  names = Object.keys(queue);
  chosen = names[getRandomInt(names.length)];
  if(queue[chosen].time < Date.now() - 60000){
    delete queue[chosen];
  }
  writeFileSync("./jsons/tomaruQueue.json", JSON.stringify(queue));
  resp.status(200).send();
});

//----------------------------- linked -----------------------------
app.get("/tomaru-kun/linked/getCommand", (req, resp) => {
  name = req.query.name;
  const data = JSON.parse(readFileSync("./jsons/tomaruLink.json", {encoding: "utf-8"}))
  if (!data.hasOwnProperty(name)){
    resp.setHeader("Content-Type", "application/json");
    resp.end("[]");
    return;
  }
  cmds = data[name].cmd
  data[name].cmd = []
  writeFileSync("./jsons/tomaruLink.json", JSON.stringify(data));
  resp.setHeader("Content-Type", "application/json");
  resp.end(JSON.stringify(cmds));
});
app.post("/tomaru-kun/linked/setCommand", (req, resp) => {
  name = req.body.name;
  cmd = req.body.cmd;
  const data = JSON.parse(readFileSync("./jsons/tomaruLink.json", {encoding: "utf-8"}));
  data[name].cmd[data[name].cmd.length] = cmd;
  writeFileSync("./jsons/tomaruLink.json", JSON.stringify(data));
  resp.status(200).send()
});
app.post("/tomaru-kun/linked/disconnect", (req, resp) => {
  name = req.body.name;
  password = req.body.password;
  const data = JSON.parse(readFileSync("./jsons/tomaruLink.json", {encoding: "utf-8"}));
  delete data[name];
  writeFileSync("./jsons/tomaruLink.json", JSON.stringify(data));
  const queue = JSON.parse(readFileSync("./jsons/tomaruQueue.json", {encoding: "utf-8"}));
  queue[name] = {password: password, time: Date.now(), com: {}};
  writeFileSync("./jsons/tomaruQueue.json", JSON.stringify(queue));
  resp.status(200).send()
});
app.post("/tomaru-kun/linked/sendPic", upload.single("file"), (req, resp) => {
  console.log(req.file.originalname);
  resp.send()
});
app.post("/tomaru-kun/linked/updateTimestamp", (req, resp) => {
  name = req.body.name;
  const data = JSON.parse(readFileSync("./jsons/tomaruLink.json", {encoding: "utf-8"}));
  data[name].time = Date.now();
  names = Object.keys(data);
  chosen = names[getRandomInt(names.length)];
  if(data[chosen].time < Date.now() - 60000){
    delete data[chosen];
  }
  writeFileSync("./jsons/tomaruLink.json", JSON.stringify(data));
  resp.status(200).send();
});

function getDistanceOnEarth(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}
function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

module.exports = app;