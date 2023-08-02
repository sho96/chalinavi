const { readFile, readFileSync, writeFile, writeFileSync} = require("fs");
//import {side, shift, degToRad, extractLocations, countIntersections, isIntersecting, calcBoundingBox, findDangerLocationsWithinRange} from './detect.mjs';

var http = require('http');
var https = require('https');
var nodemailer = require('nodemailer');
const mongoose = require("mongoose");
//var privateKey  = readFileSync('cert.key', 'utf-8');
//var privateKey  = readFileSync('key.pem', 'utf-8');
//var certificate = readFileSync('cert.crt', 'utf-8');
//var certificate = readFileSync('cert.pem', 'utf-8');

//var credentials = {key: privateKey, cert: certificate};


var express = require('express');
var app = express();
// server routes
const userDataManagementRouter = require("./js-routes/userDataManagement.js");
const menuRouter = require("./js-routes/menu.js");
const applicationsRouter = require("./js-routes/applications.js");
const dashboardRouter = require("./js-routes/dashboard.js");
const settingsRouter = require("./js-routes/settings.js");
const profileRouter = require("./js-routes/profile.js");
const imgsRouter = require("./js-routes/imgs.js");
const soundsRouter = require("./js-routes/sounds.js");
const jsonsRouter = require("./js-routes/jsons.js");

app.use(userDataManagementRouter);
app.use(menuRouter);
app.use(applicationsRouter);
app.use(dashboardRouter);
app.use(settingsRouter);
app.use(profileRouter);
app.use(imgsRouter);
app.use(soundsRouter);
app.use(jsonsRouter);

app.use(express.json());

console.log("express loaded");


//------------ connecting to mongoDB ------------
//username: chalinavi
//password: maetakaKagakubuChalinavi
mongoose.connect(
  "mongodb+srv://chalinavi:maetakaKagakubuChalinavi@chalinavidb.j2jamgc.mongodb.net/database?retryWrites=true&w=majority"
)
.then(() => console.log("connected to mongo db"))
.catch(err => console.log(err));



//------------------------------- user data managements --------------------------------
//declared on the top

//------------------------------- menu page --------------------------------
//declared on the top

//-------------------------------- applications ----------------------------------
//declared on the top

//-------------------------------- dashboard ----------------------------------
//declared on the top

//-------------------------------- settings ----------------------------------
//declared on the top

//--------------------------------- profile ----------------------------------
//declared on the top

//--------------------------------- general system functions ---------------------------------
app.post("/updateToken", async (req, resp) => {
  console.log(`request for token update of "${req.body["token"]}"`);
  const tokens = JSON.parse(readFileSync("./jsons/activeTokens.json", {encoding: "utf-8"}));
  const token = req.body["token"];
  if(tokens[token] == null){
    console.log(`token update rejected for ${token}`);
    return;
  }
  tokens[token]["due"] = Date.now() + 60000;
  writeFileSync("./jsons/activeTokens.json", JSON.stringify(tokens));
  resp.status(200).send("updated");
});

app.post("/temp", (req, resp) => {
  console.log("temp access");
  resp.status(200).send("hello");
})

// log out
app.post("/logOut", (req, resp) => {
  console.log(`log out requested for token: "${req.body["token"]}"`);
  tokens = JSON.parse(readFileSync("./jsons/activeTokens.json", {encoding: "utf-8"}));
  delete tokens[req.body["token"]];
  writeFileSync("./jsons/activeTokens.json", JSON.stringify(tokens));
})

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

function deleteOldTokens(){
  tokens = JSON.parse(readFileSync("./jsons/activeTokens.json", {encoding: "utf-8"}));
  updated = {};
  for(token in tokens){
    if(tokens[token]["due"] >= Date.now()){
      updated[token] = {due: tokens[token]["due"]};
    }
  }
  writeFileSync("./jsons/activeTokens.json", JSON.stringify(updated));
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function sendCode(toEmailAddress, username, verificationCode, message) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'chalinavimailer@gmail.com',
      pass: 'pqntqgngxjteqber'
    }
  });

  const mailOptions = {
    from: 'chalinavimailer@gmail.com',
    to: toEmailAddress,
    subject: `Email verification for ${username}`,
    text: `${message}\nHere's the verification code: ${verificationCode}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

function sendEmail(toEmailAddress, subject, content){
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'chalinavimailer@gmail.com',
      pass: 'pqntqgngxjteqber'
    }
  });

  const mailOptions = {
    from: 'chalinavimailer@gmail.com',
    to: toEmailAddress,
    subject: subject,
    text: content,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
function sendEmailMultiple(toEmailAddresses, subject, content){
  for(const addr in toEmailAddresses){
    sendEmail(toEmailAddresses[addr], subject, content);
  }
}

//projecthomesafer@gmail.com -- uagquinrfweblmpf
//chalinavimailer@gmail.com -- pqntqgngxjteqber

//----------------------------- responding to image requests -------------------------------
//declared on the top

//----------------------------- responding to sound requests -------------------------------
//declared on the top

//----------------------------- responding to json requests -------------------------------
//declared on the top

//----------------------------- set icon ------------------------------
app.use('/favicon.ico', express.static('./favicon.ico'));

//----------------------------- health check -------------------------------
app.get("/health", (req, resp) => {
  resp.status(200).send();
});

//----------------------------- add accident location data -----------------------------
app.post("/addLocation", (req, resp) => {
  if(req.body.password != "mchaaleintaavkia"){
    resp.status(200).send()
    return;
  }
  delete req.body.password;
  const locations = JSON.parse(readFileSync("./jsons/dangerLocations.json", {encoding: "utf-8"}));
  locations[locations.length] = req.body;
  writeFileSync("./jsons/dangerLocations.json", JSON.stringify(locations));
  delete locations;
  resp.status(200).send("added");
});

//----------------------------- delete accident location datas -----------------------------
app.get("/deleteLocations", (req, resp) => {
  console.log("deleteLocations requested");
  const password = req.query["password"];
  if(password == "mchaaleintaavkia"){
    console.log("deleted");
    writeFileSync("./jsons/dangerLocations.json", "[]");
    resp.status(200).send("successfully deleted");
  }else{
    console.log("passwordWrong");
    resp.status(200).send("");
  }
});

//------------------------------ test ------------------------------
/*app.get("/test", (req ,resp) => {
  resp.status(200).send(readFileSync("./htmls/test/login-test.html", {encoding: "utf-8"}));
})
*/

var httpServer = http.createServer(app);

let port = process.env.PORT || 15243;
httpServer.listen(port, () => {
  console.log(`server listening on port ${port}`);
});