const { readFile, readFileSync, writeFile, writeFileSync} = require("fs");
const fs = require("fs");
var nodemailer = require('nodemailer');
var express = require('express');
var app = express();

app.use(express.json());

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
app.get("/imgs/apps/rate/rate-jp.jpg", (req, resp) => {
    resp.status(200).send(readFileSync("./imgs/apps/rate/rate-jp.jpg"));
});
app.get("/imgs/apps/rate/rate-en.jpg", (req, resp) => {
    resp.status(200).send(readFileSync("./imgs/apps/rate/rate-en.jpg"));
});
app.get("/imgs/apps/hazardMap/:filename", (req, resp) => {
    filename = req.params.filename;
    resp.status(200).send(readFileSync(`./imgs/apps/hazardMap/${filename}`));
});
app.get("/apps/hazardMap/imgs/:filename", (req, resp) => {
    filename = req.params.filename;
    resp.status(200).send(`<img src="/imgs/apps/hazardMap/${filename}" alt="not found...">`);
});
app.get("/apps/hazardMap/listImgs", (req, resp) => {
    fs.readdir("./imgs/apps/hazardMap/", (err, files) => {
        resp.setHeader("Content-Type", "application/json")
        resp.end(JSON.stringify(files));
    });
});

module.exports = app;