const { readFile, readFileSync, writeFile, writeFileSync} = require("fs");
var express = require('express');
var app = express();

app.use(express.json());

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