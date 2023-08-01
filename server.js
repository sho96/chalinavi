const { readFile, readFileSync, writeFile, writeFileSync} = require("fs");
//import {side, shift, degToRad, extractLocations, countIntersections, isIntersecting, calcBoundingBox, findDangerLocationsWithinRange} from './detect.mjs';

var http = require('http');
var https = require('https');
var nodemailer = require('nodemailer');
//var privateKey  = readFileSync('cert.key', 'utf-8');
//var privateKey  = readFileSync('key.pem', 'utf-8');
//var certificate = readFileSync('cert.crt', 'utf-8');
//var certificate = readFileSync('cert.pem', 'utf-8');

//var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

app.use(express.json());

console.log("express loaded");


//------------------------------- user data managements --------------------------------
// base
app.get("/", (req, resp) => {
  console.log("main request");
  resp.redirect("/login");
});

// log in functionalities
app.get("/login", (req, resp) => {
  const lang = req.query["lang"];
  resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  resp.setHeader("Pragma", "no-cache");
  resp.setHeader("Expires", "0");
  if(lang == "en"){
    resp.status(200).send(readFileSync("./htmls-en/login.html", {encoding: "utf-8"}));
  }else if(lang == "ja"){
    resp.status(200).send(readFileSync("./htmls/login.html", {encoding: "utf-8"}));
  }else{
    resp.status(200).send(readFileSync("./htmls-en/login.html", {encoding: "utf-8"}));
  }
});
app.post("/sendLogin", (req, resp) => {
  console.log("loginSent");
  username = req.body["username"];
  password = req.body["password"];
  const users = JSON.parse(readFileSync("./jsons/registeredUsers.json", {encoding: "utf-8"}));
  //console.log(users);
  if(!(username in users)){
    resp.setHeader("Content-Type", "application/json");
    resp.end(JSON.stringify({status: "username and password don't match"}))
  }
  if(users[username]["password"] != password){
    resp.setHeader("Content-Type", "application/json");
    resp.end(JSON.stringify({status: "username and password don't match"}));
    return;
  } 
  delete users;
  const availableLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcefghijklmnopqrstuvwxyz0123456789-_";
  const length = 20;
  let token = "";
  for(let i = 0; i < length; i++){
    token += availableLetters[Math.floor(Math.random() * availableLetters.length)];
  }
  deleteOldTokens();
  const tokens = JSON.parse(readFileSync("./jsons/activeTokens.json", {encoding: "utf-8"}));
  tokens[token] = {due: Date.now() + 60000};
  //console.log(tokens);
  writeFileSync("./jsons/activeTokens.json", JSON.stringify(tokens));
  delete tokens;
  const settings = JSON.parse(readFileSync("./jsons/userSettings.json", {encoding: "utf-8"}));
  resp.setHeader("Content-Type", "application/json");
  resp.end(JSON.stringify({status: "success", token: token, language: settings[username].language}));
  delete settings;
  console.log(`token of "${token}" sent`);
})

// sign up functionalities
app.get("/signup", (req, resp) => {
  console.log("signup request");
  const lang = req.query["lang"];
  resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  resp.setHeader("Pragma", "no-cache");
  resp.setHeader("Expires", "0");
  if(lang == "en"){
    resp.status(200).send(readFileSync("./htmls-en/signup.html", {encoding: "utf-8"}));
  }else if(lang == "ja"){
    resp.status(200).send(readFileSync("./htmls/signup.html", {encoding: "utf-8"}));
  }else{
    resp.status(200).send(readFileSync("./htmls-en/signup.html", {encoding: "utf-8"}));
  }
});
app.post("/verifyEmail", (req, resp) => {
  email = req.body["email"];
  verificationCode = req.body["code"];
  const codes = JSON.parse(readFileSync("./jsons/verificationCodes.json", {encoding : "utf-8"}));
  if (codes[email]["code"] == verificationCode){
    //verified
    if(codes[email].due <= Date.now()){
      delete codes[email];
      writeFileSync("./jsons/verificationCodes.json", JSON.stringify(codes));
      resp.setHeader("Content-Type", "application/json");
      resp.end(JSON.stringify({status: "expired"}));
      return;
    }
    const users = JSON.parse(readFileSync("./jsons/registeredUsers.json", {encoding: "utf-8"}));
    const settings = JSON.parse(readFileSync("./jsons/userSettings.json"), {encoding: "utf-8"});

    const userdata = {password: codes[email]["password"], email: email};
    const language = codes[email]["language"];
    settings[codes[email]["username"]] = {detectionLevel: "5", detectionBoxWidth: 1, detectionBoxHeight: 40, language: language}; 
    users[codes[email]["username"]] = userdata;

    delete codes[email];

    writeFileSync("./jsons/registeredUsers.json", JSON.stringify(users), err => {if(err) console.log(err)});
    writeFileSync("./jsons/verificationCodes.json", JSON.stringify(codes), err => {if(err) console.log(err)});
    writeFileSync("./jsons/userSettings.json", JSON.stringify(settings), err => {if(err) console.log(err)});

    delete users;
    delete settings;

    resp.setHeader('Content-Type', 'application/json');
    resp.end(JSON.stringify({status: "verified"}));
    console.log(`verified ${email}`);
  }else{
    //not verified
    console.log(`attempt on verifying ${email}`);
    resp.setHeader('Content-Type', 'application/json');
    resp.end(JSON.stringify({status: "not verified"}));
  }
});
app.post("/sendSignup", (req, resp) => {
  const data = req.body;
  const username = data["username"];
  const password = data["password"];
  const email = data["email"];
  const language = data["language"];
  
  const verificationCodes = JSON.parse(readFileSync("./jsons/verificationCodes.json"));
  let usedUsernames = []
  let i = 0;
  for(const emailAddress in verificationCodes){
    if(verificationCodes[emailAddress].due <= Date.now()){
      delete verificationCodes[emailAddress];
      continue;
    }
    usedUsernames[i] = verificationCodes[emailAddress]["username"];
    i++;
  }
  writeFileSync("./jsons/verificationCodes.json", JSON.stringify(verificationCodes));
  delete verificationCodes;
  const registeredUsers = JSON.parse(readFileSync("./jsons/registeredUsers.json"));
  for(const registeredUsername in registeredUsers){
    usedUsernames[i] = registeredUsername;
    i++;
  }
  delete registeredUsers;
  
  console.log(usedUsernames);

  if(usedUsernames.includes(username)){
    //username already taken
    resp.setHeader("Content-Type", "application/json");
    resp.end(JSON.stringify({status: "username already taken"}))
    return;
  }

  const verificationCode = `${getRandomInt(9)+1}${getRandomInt(10)}${getRandomInt(10)}${getRandomInt(10)}${getRandomInt(10)}`;
  const codes = JSON.parse(readFileSync("./jsons/verificationCodes.json", {encoding : "utf-8"}));
  codes[email] = {code: verificationCode, username: username, password: password, language: language, due: Date.now()+600000};
  sendCode(email, username, verificationCode, "Hi! Thank you for registering!");
  writeFileSync("./jsons/verificationCodes.json", JSON.stringify(codes));
  delete codes;
  resp.setHeader("Content-Type", "application/json");
  resp.end(JSON.stringify({status: "success"}))
});


//------------------------------- menu page --------------------------------
//menu page
app.get("/menu", (req, resp) => {
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
  delete activeTokens;
  const lang = req.query["lang"];
  resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  resp.setHeader("Pragma", "no-cache");
  resp.setHeader("Expires", "0");
  if(lang == "en"){
    resp.status(200).send(readFileSync("./htmls-en/menu.html", {encoding : "utf-8"}));
  }else if(lang == "ja"){
    resp.status(200).send(readFileSync("./htmls/menu.html", {encoding : "utf-8"}));
  }else{
    resp.status(200).send(readFileSync("./htmls-en/menu.html", {encoding : "utf-8"}));
  }
});

// setting updates
app.post("/updateSettings", (req, resp) => {
  const settings = req.body;
  console.log(settings);
  const username = settings.username;
  console.log(username);
  delete settings.username;
  const usersettings = JSON.parse(readFileSync("./jsons/userSettings.json", {encoding: "utf-8"}));
  usersettings[username] = settings;
  console.log(usersettings);
  writeFileSync("./jsons/userSettings.json", JSON.stringify(usersettings));
  console.log(`settings updated for user "${username}`);
})
app.get("/getSettings", (req, resp) => {
  const username = req.query.username;
  const userSettings = JSON.parse(readFileSync("./jsons/userSettings.json"));
  const settings = userSettings[username];
  console.log(`getSettings request from ${username}`);
  resp.setHeader("Content-Type", "application/json");
  resp.end(JSON.stringify(settings));
})


//-------------------------------- applications ----------------------------------
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
  console.log("vehicle data sent");
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
  console.log("get vehicle data request");
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


//-------------------------------- dashboard ----------------------------------
app.get("/getDashboard", (req, resp) => {
  const username = req.query.username;
  const travelDatas = JSON.parse(readFileSync("./jsons/travelDatas.json", {encoding: "utf-8"}));
  console.log(username);
  console.log(travelDatas);
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


//--------------------------------- profile ----------------------------------
app.get("/getProfile", (req, resp) => {
  const username = req.query.username;
  const userdatas = JSON.parse(readFileSync("./jsons/registeredUsers.json", {encoding: "utf-8"}));
  data = userdatas[username];
  resp.setHeader("Content-Type", "application/json");
  resp.end(JSON.stringify(data));
})
//change email
app.get("/profile/changeEmail", (req, resp) => {
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
    resp.status(200).send(readFileSync("./htmls-en/profile/changeEmail.html", {encoding : "utf-8"}));
  }else if(lang == "ja"){
    resp.status(200).send(readFileSync("./htmls/profile/changeEmail.html", {encoding : "utf-8"}));
  }else{
    resp.status(200).send(readFileSync("./htmls-en/profile/changeEmail.html", {encoding : "utf-8"}));
  }
})
app.post("/profile/changeEmail/sendEmail", (req, resp) => {
  const username = req.body["username"];
  const email = req.body["email"];
  console.log(`change email request from ${username}`);

  let codes = JSON.parse(readFileSync("./jsons/changeEmail.json", {encoding: "utf-8"}));
  for(key in codes){
    if (codes[key].due >= Date.now()){
      delete codes[key];
    }
  }
  const verificationCode = `${getRandomInt(9)+1}${getRandomInt(10)}${getRandomInt(10)}${getRandomInt(10)}${getRandomInt(10)}`;
  codes[username] = {email: email, code: verificationCode, due: Date.now()+600000};
  writeFileSync("./jsons/changeEmail.json", JSON.stringify(codes));
  console.log("written");
  sendCode(email, username, verificationCode, "Email Change");
  resp.setHeader("Content-Type", "application/json");
  resp.end(JSON.stringify({status: "success"}));
});
app.post("/profile/changeEmail/verifyEmail", (req, resp) => {
  username = req.body.username;
  code = req.body.code;
  let codes = JSON.parse(readFileSync("./jsons/changeEmail.json", {encoding: "utf-8"}));
  if(codes[username].code == code){
    //verified
    console.log(`verified ${codes[username].email}`)
    const users = JSON.parse(readFileSync("./jsons/registeredUsers.json", {encoding: "utf-8"}));
    users[username].email = codes[username].email;
    delete codes[username];
    writeFileSync("./jsons/registeredUsers.json", JSON.stringify(users));
    resp.setHeader("Content-Type", "application/json");
    resp.end(JSON.stringify({status: "verified"}));
  }else{
    //not verified
    console.log(`attempt on verifying ${codes[username].email}`)
    resp.setHeader('Content-Type', 'application/json');
    resp.end(JSON.stringify({status: "not verified"}));
  }
});
//change password
app.get("/profile/changePassword", (req, resp) => {
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
    resp.status(200).send(readFileSync("./htmls-en/profile/changePassword.html", {encoding : "utf-8"}));
  }else if(lang == "ja"){
    resp.status(200).send(readFileSync("./htmls/profile/changePassword.html", {encoding : "utf-8"}));
  }else{
    resp.status(200).send(readFileSync("./htmls-en/profile/changePassword.html", {encoding : "utf-8"}));
  }
});
app.post("/profile/changePassword/sendPassword", (req, resp) => {
  const username = req.body.username;
  const oldPassword = req.body.oldPassword;
  const hashedPassword = req.body.password;
  console.log(`change password request from ${username}`);
  const users = JSON.parse(readFileSync("./jsons/registeredUsers.json", {encoding: "utf-8"}));
  if(users[username].password == oldPassword){
    users[username].password = hashedPassword;
    writeFileSync("./jsons/registeredUsers.json", JSON.stringify(users));
    resp.setHeader("Content-Type", "application/json");
    resp.end(JSON.stringify({status: "success"}));
  }else{
    resp.setHeader("Content-Type", "application/json");
    resp.end(JSON.stringify({status: "incorrect password"}))
  }
});
//delete account
app.get("/profile/deleteAccount", (req, resp) => {
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
    resp.status(200).send(readFileSync("./htmls-en/profile/deleteAccount.html", {encoding : "utf-8"}));
  }else if(lang == "ja"){
    resp.status(200).send(readFileSync("./htmls/profile/deleteAccount.html", {encoding : "utf-8"}));
  }else{
    resp.status(200).send(readFileSync("./htmls-en/profile/deleteAccount.html", {encoding : "utf-8"}));
  }
});
app.post("/profile/deleteAccount/delete", (req, resp) => {
  const username = req.body.username;
  const hashedPassword = req.body.password;
  const users = JSON.parse(readFileSync("./jsons/registeredUsers.json", {encoding: "utf-8"}));
  if (users[username].password == hashedPassword){
    //delete account
    console.log(`delete account request frmom ${username}`);
    delete users[username];
    writeFileSync("./jsons/registeredUsers.json", JSON.stringify(users));

    const settings = readFileSync("./jsons/userSettings.json", {encoding: "utf-8"});
    delete settings[username];
    writeFile("./jsons/userSettings.json", JSON.stringify(settings), err => {if(err) console.log(err)});

    resp.setHeader("Content-Type", "application/json");
    resp.end(JSON.stringify({status: "success"}));
  }else{
    //password incorrect
    console.log(`attempt on deleting ${username}`);
    resp.setHeader("Content-Type", "application/json");
    resp.end(JSON.stringify({status: "incorrect password"}));
  }
});


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

/*
//reset user data
app.get("/reset", (req, resp) => {
  writeFileSync("./jsons/verificationCodes.json", "{}");
  writeFileSync("./jsons/registeredUsers.json", "{}");
})*/

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
app.get("/imgs/menu/x.png", (req, resp) => {
  resp.status(200).send(readFileSync("./imgs/menu/x.png"));
});
app.get("/imgs/menu/chalinavi.jpg", (req, resp) => {
  resp.status(200).send(readFileSync("./imgs/menu/chalinavi.jpg"));
});
app.get("/imgs/menu/hazardMap.jpg", (req, resp) => {
  resp.status(200).send(readFileSync("./imgs/menu/hazardMap.jpg"));
});
app.get("/imgs/menu/rateThisSystem.jpg", (req, resp) => {
  resp.status(200).send(readFileSync("./imgs/menu/rateThisSystem.jpg"));
});
app.get("/imgs/apps/navigation/warning.png", (req, resp) => {
  resp.status(200).send(readFileSync("./imgs/apps/navigation/warning.png"));
});
app.get("/imgs/apps/rate/rate.png", (req, resp) => {
  resp.status(200).send(readFileSync("./imgs/apps/rate/rate.png"));
});

//----------------------------- responding to sound requests -------------------------------
app.get("/sounds/ja/10m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/ja/10m.mp3"));
});
app.get("/sounds/ja/20m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/ja/20m.mp3"));
});
app.get("/sounds/ja/30m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/ja/30m.mp3"));
});
app.get("/sounds/ja/40m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/ja/40m.mp3"));
});
app.get("/sounds/ja/50m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/ja/50m.mp3"));
});
app.get("/sounds/ja/60m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/ja/60m.mp3"));
});
app.get("/sounds/ja/70m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/ja/70m.mp3"));
});
app.get("/sounds/ja/80m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/ja/80m.mp3"));
});
app.get("/sounds/ja/90m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/ja/90m.mp3"));
});
app.get("/sounds/ja/100m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/ja/100m.mp3"));
});
app.get("/sounds/ja/rear_impact.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/ja/rear_impact.mp3"));
});
app.get("/sounds/ja/sudden_brake.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/ja/sudden_brake.mp3"));
});

app.get("/sounds/en/10m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/en/10m.mp3"));
});
app.get("/sounds/en/20m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/en/20m.mp3"));
});
app.get("/sounds/en/30m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/en/30m.mp3"));
});
app.get("/sounds/en/40m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/en/40m.mp3"));
});
app.get("/sounds/en/50m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/en/50m.mp3"));
});
app.get("/sounds/en/60m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/en/60m.mp3"));
});
app.get("/sounds/en/70m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/en/70m.mp3"));
});
app.get("/sounds/en/80m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/en/80m.mp3"));
});
app.get("/sounds/en/90m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/en/90m.mp3"));
});
app.get("/sounds/en/100m.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/en/100m.mp3"));
});
app.get("/sounds/en/rear_impact.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/en/rear_impact.mp3"));
});
app.get("/sounds/en/sudden_brake.mp3", (req, resp) => {
  resp.status(200).send(readFileSync("./sounds/en/sudden_brake.mp3"));
});

//----------------------------- responding to json requests -------------------------------
//temporal datas
app.get("/jsons/activeVehicles.json", (req, resp) => {
  if(req.query.password !== "mchaaleintaavkia"){
    resp.status(200).send();
    return;
  }
  resp.setHeader("Content-Type", "application/json");
  resp.end(readFileSync("./jsons/activeVehicles.json"));
});

//permanent datas
app.get("/jsons/travelDatas.json", (req, resp) => {
  if(req.query.password !== "mchaaleintaavkia"){
    resp.status(200).send();
    return;
  }
  resp.setHeader("Content-Type", "application/json");
  resp.end(readFileSync("./jsons/travelDatas.json"));
});
app.get("/jsons/dangerLocations.json", (req, resp) => {
  if(req.query.password !== "mchaaleintaavkia"){
    resp.status(200).send();
    return;
  }
  resp.setHeader("Content-Type", "application/json");
  resp.end(readFileSync("./jsons/dangerLocations.json"));
});
app.get("/jsons/registeredUsers.json", (req, resp) => {
  if(req.query.password !== "mchaaleintaavkia"){
    resp.status(200).send();
    return;
  }
  resp.setHeader("Content-Type", "application/json");
  resp.end(readFileSync("./jsons/registeredUsers.json"));
});
app.get("/jsons/userSettings.json", (req, resp) => {
  if(req.query.password !== "mchaaleintaavkia"){
    resp.status(200).send();
    return;
  }
  resp.setHeader("Content-Type", "application/json");
  resp.end(readFileSync("./jsons/userSettings.json"));
});
app.get("/jsons/userRatings.json", (req, resp) => {
  if(req.query.password !== "mchaaleintaavkia"){
    resp.status(200).send();
    return;
  }
  resp.setHeader("Content-Type", "application/json");
  resp.end(readFileSync("./jsons/userRatings.json"));
});
app.get("/jsons/all", (req, resp) => {
  if(req.query.password !== "mchaaleintaavkia"){
    resp.status(200).send();
    return;
  }
  const stringToSend = `travelDatas.json\n${readFileSync("./jsons/travelDatas.json")}\n\ndangerLocations.json\n${readFileSync("./jsons/dangerLocations.json")}\n\nregisteredUsers.json\n${readFileSync("./jsons/registeredUsers.json")}\n\nuserSettings.json\n${readFileSync("./jsons/userSettings.json")}\n\nuserRatings.json\n${readFileSync("./jsons/userRatings.json")}`;
  resp.setHeader("Content-Type", "application/json");
  resp.status(200).send(stringToSend);
});


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