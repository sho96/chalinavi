const { readFile, readFileSync, writeFile, writeFileSync} = require("fs");
var express = require('express');
var app = express();

app.use(express.json());

app.get("/sounds/ja/10m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/ja/10m.mp3"));
});
app.get("/sounds/ja/20m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/ja/20m.mp3"));
});
app.get("/sounds/ja/30m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/ja/30m.mp3"));
});
app.get("/sounds/ja/40m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/ja/40m.mp3"));
});
app.get("/sounds/ja/50m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/ja/50m.mp3"));
});
app.get("/sounds/ja/60m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/ja/60m.mp3"));
});
app.get("/sounds/ja/70m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/ja/70m.mp3"));
});
app.get("/sounds/ja/80m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/ja/80m.mp3"));
});
app.get("/sounds/ja/90m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/ja/90m.mp3"));
});
app.get("/sounds/ja/100m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/ja/100m.mp3"));
});
app.get("/sounds/ja/rear_impact.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/ja/rear_impact.mp3"));
});
app.get("/sounds/ja/sudden_brake.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/ja/sudden_brake.mp3"));
});

app.get("/sounds/en/10m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/en/10m.mp3"));
});
app.get("/sounds/en/20m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/en/20m.mp3"));
});
app.get("/sounds/en/30m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/en/30m.mp3"));
});
app.get("/sounds/en/40m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/en/40m.mp3"));
});
app.get("/sounds/en/50m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/en/50m.mp3"));
});
app.get("/sounds/en/60m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/en/60m.mp3"));
});
app.get("/sounds/en/70m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/en/70m.mp3"));
});
app.get("/sounds/en/80m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/en/80m.mp3"));
});
app.get("/sounds/en/90m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/en/90m.mp3"));
});
app.get("/sounds/en/100m.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/en/100m.mp3"));
});
app.get("/sounds/en/rear_impact.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/en/rear_impact.mp3"));
});
app.get("/sounds/en/sudden_brake.mp3", async (req, resp) => {
    resp.status(200).send(readFileSync("./sounds/en/sudden_brake.mp3"));
});  

module.exports = app;