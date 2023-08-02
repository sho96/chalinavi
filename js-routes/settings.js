const { readFile, readFileSync, writeFile, writeFileSync} = require("fs");
var express = require('express');
var app = express();

app.use(express.json());

app.post("/updateSettings", (req, resp) => {
    const settings = req.body;
    const username = settings.username;
    delete settings.username;
    const usersettings = JSON.parse(readFileSync("./jsons/userSettings.json", {encoding: "utf-8"}));
    usersettings[username] = settings;
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



module.exports = app;