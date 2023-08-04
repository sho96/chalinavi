const { readFile, readFileSync, writeFile, writeFileSync} = require("fs");
var nodemailer = require('nodemailer');
var express = require('express');
var app = express();

app.use(express.json());

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

module.exports = app;

