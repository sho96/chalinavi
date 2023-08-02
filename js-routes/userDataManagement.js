const { readFile, readFileSync, writeFile, writeFileSync} = require("fs");
var express = require('express');
var app = express();

app.use(express.json());

// base
app.get("/", async (req, resp) => {
    console.log("main request");
    resp.redirect("/login");
  });
  
  // log in functionalities
  app.get("/login", async (req, resp) => {
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
  app.post("/sendLogin", async (req, resp) => {
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
  app.get("/signup", async (req, resp) => {
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
  app.post("/verifyEmail", async (req, resp) => {
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
  app.post("/sendSignup", async (req, resp) => {
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

module.exports = app;