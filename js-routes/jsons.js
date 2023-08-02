const { readFile, readFileSync, writeFile, writeFileSync} = require("fs");
var nodemailer = require('nodemailer');
var express = require('express');
var app = express();

app.use(express.json());

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

module.exports = app;