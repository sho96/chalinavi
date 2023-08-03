const { readFile, readFileSync, writeFile, writeFileSync} = require("fs");
var nodemailer = require('nodemailer');
var express = require('express');
var app = express();

app.use(express.json());

app.get("/tomaru-kun/register", (req, resp) => {
    const queue = JSON.parse(readFileSync("./jsons/tomaruQueue.json"));
    code = 
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