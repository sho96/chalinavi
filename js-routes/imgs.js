const { readFile, readFileSync, writeFile, writeFileSync} = require("fs");
var express = require('express');
var app = express();

app.use(express.json());

app.get("/imgs/menu/x.png", async (req, resp) => {
    resp.status(200).send(readFileSync("./imgs/menu/x.png"));
});
app.get("/imgs/menu/chalinavi.jpg", async (req, resp) => {
    resp.status(200).send(readFileSync("./imgs/menu/chalinavi.jpg"));
});
app.get("/imgs/menu/hazardMap.jpg", async (req, resp) => {
    resp.status(200).send(readFileSync("./imgs/menu/hazardMap.jpg"));
});
app.get("/imgs/menu/rateThisSystem.jpg", async (req, resp) => {
    resp.status(200).send(readFileSync("./imgs/menu/rateThisSystem.jpg"));
});
app.get("/imgs/apps/navigation/warning.png", async (req, resp) => {
    resp.status(200).send(readFileSync("./imgs/apps/navigation/warning.png"));
});
app.get("/imgs/apps/rate/rate.png", async (req, resp) => {
    resp.status(200).send(readFileSync("./imgs/apps/rate/rate.png"));
});  

module.exports = app;