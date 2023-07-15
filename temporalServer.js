const { readFile, readFileSync, writeFile, writeFileSync} = require("fs");

var http = require('http');
var https = require('https');
var nodemailer = require('nodemailer');
//var privateKey  = readFileSync('cert.key', 'utf-8');
var privateKey  = readFileSync('key.pem', 'utf-8');
//var certificate = readFileSync('cert.crt', 'utf-8');
var certificate = readFileSync('cert.pem', 'utf-8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

app.use(express.json());

console.log("express loaded");

//base
app.get("/", (req, resp) => {
    resp.status(200).send(readFileSync("./htmls/bicycleNavigation.html", {encoding: "utf-8"}));
});

app.get("/imgs/menu/x.png", (req, resp) => {
    resp.status(200).send(readFileSync("./imgs/menu/x.png"));
});

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(32415);
console.log("https listening");