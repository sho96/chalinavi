const { readFile, readFileSync, writeFile, writeFileSync } = require("fs");
var nodemailer = require("nodemailer");
var express = require("express");
var app = express();

app.use(express.json());

//navigation page
app.get("/apps/navigation", (req, resp) => {
  const activeTokens = JSON.parse(
    readFileSync("./jsons/activeTokens.json", { encoding: "utf-8" })
  );
  if (!(req.query.token in activeTokens)) {
    resp.redirect("/login");
    console.log("token doesn't exist");
    return;
  }
  if (activeTokens[req.query.token]["due"] <= Date.now()) {
    delete activeTokens[req.query.token];
    writeFileSync("./jsons/activeTokens.json", JSON.stringify(activeTokens));
    resp.redirect("/login");
    console.log("token expired");
    return;
  }
  const lang = req.query["lang"];
  resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  resp.setHeader("Pragma", "no-cache");
  resp.setHeader("Expires", "0");
  if (lang == "en") {
    resp
      .status(200)
      .send(
        readFileSync("./htmls-en/apps/navigation.html", { encoding: "utf-8" })
      );
  } else if (lang == "ja") {
    resp
      .status(200)
      .send(
        readFileSync("./htmls/apps/navigation.html", { encoding: "utf-8" })
      );
  } else {
    resp
      .status(200)
      .send(
        readFileSync("./htmls-en/apps/navigation.html", { encoding: "utf-8" })
      );
  }
});
app.post("/apps/navigation/sendData", (req, resp) => {
  const type = req.body.type;
  const location = req.body.location;
  const username = req.body.username;
  const img = req.body.img;

  console.log(`received accident: ${type}`);

  const dangerLocations = JSON.parse(
    readFileSync("./jsons/dangerLocations.json")
  );
  dangerLocations[dangerLocations.length] = {
    type: type,
    time: Date.now(),
    location: { lat: location.lat, lon: location.lon },
    user: username,
    img: img,
  };

  writeFileSync(
    "./jsons/dangerLocations.json",
    JSON.stringify(dangerLocations)
  );
  resp.status(200).send("recorded");
});
app.get("/apps/navigation/getData", (req, resp) => {
  lat = req.query.lat;
  lon = req.query.lon;

  const dangerLocations = JSON.parse(
    readFileSync("./jsons/dangerLocations.json")
  );
  dataToSend = [];
  for (i in dangerLocations) {
    data = dangerLocations[i];
    if (
      getDistanceOnEarth(lat, lon, data.location.lat, data.location.lon) < 7500
    ) {
      dataToSend[dataToSend.length] = data;
    }
  }
  resp.setHeader("Content-Type", "application/json");
  resp.end(JSON.stringify(dataToSend));
});
app.post("/apps/navigation/sendVehicleData", (req, resp) => {
  const _start = Date.now();

  token = req.body.token;
  location = req.body.location;
  direction = req.body.direction;
  speed = req.body.speed;
  type = req.body.type;
  let vehicleDatas = JSON.parse(
    readFileSync("./jsons/activeVehicles.json", { encoding: "utf-8" })
  );
  vehicleDatas[token] = {
    type: type,
    location: location,
    direction: direction,
    speed: speed,
    time: Date.now(),
  };
  //delete un-updated vehicle datas
  tokens = Object.keys(vehicleDatas);
  picked = getRandomInt(tokens.length);
  if (vehicleDatas[tokens[picked]].time < Date.now() - 120000) {
    delete vehicleDatas[tokens[picked]];
  }
  writeFileSync("./jsons/activeVehicles.json", JSON.stringify(vehicleDatas));

  const _end = Date.now();
  resp.status(200).send(`${_end - _start}`);
  console.log(
    `/POST /apps/navigation/sendVehicleData ${_end - _start} ${token}`
  );
});
app.get("/apps/navigation/getVehicleData", (req, resp) => {
  const _start = Date.now();

  lat = req.query.lat;
  lon = req.query.lon;

  const vehicleDatas = JSON.parse(readFileSync("./jsons/activeVehicles.json"));
  dataToSend = {};
  for (token in vehicleDatas) {
    data = vehicleDatas[token];
    if (
      getDistanceOnEarth(lat, lon, data.location.lat, data.location.lon) < 3000
    ) {
      dataToSend[token] = data;
    }
  }
  const _end = Date.now();
  console.log(`/GET /apps/navigation/getVehicleData ${_end - _start}`);

  resp.setHeader("Content-Type", "application/json");
  resp.end(JSON.stringify({ ...dataToSend, internalDelay: _end - _start }));
});
app.post("/apps/navigation/sendSummary", (req, resp) => {
  const traveledDistance = req.body.distanceTraveled;
  const username = req.body.username;
  let travelDatas = JSON.parse(
    readFileSync("./jsons/travelDatas.json", { encoding: "utf-8" })
  );
  if (!(username in travelDatas)) {
    travelDatas[username] = { totalDistanceTraveled: 0 };
  }
  travelDatas[username].totalDistanceTraveled += traveledDistance;
  writeFileSync("./jsons/travelDatas.json", JSON.stringify(travelDatas));
  resp.status(200).send();
});
app.get("/apps/navigation-tomaruKun", (req, resp) => {
  const activeTokens = JSON.parse(
    readFileSync("./jsons/activeTokens.json", { encoding: "utf-8" })
  );
  if (!(req.query.token in activeTokens)) {
    resp.redirect("/login");
    console.log("token doesn't exist");
    return;
  }
  if (activeTokens[req.query.token]["due"] <= Date.now()) {
    delete activeTokens[req.query.token];
    writeFileSync("./jsons/activeTokens.json", JSON.stringify(activeTokens));
    resp.redirect("/login");
    console.log("token expired");
    return;
  }
  const lang = req.query["lang"];
  resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  resp.setHeader("Pragma", "no-cache");
  resp.setHeader("Expires", "0");
  if (lang == "en") {
    resp
      .status(200)
      .send(
        readFileSync("./htmls-en/apps/navigation-tomaruKun.html", {
          encoding: "utf-8",
        })
      );
  } else if (lang == "ja") {
    resp
      .status(200)
      .send(
        readFileSync("./htmls/apps/navigation-tomaruKun.html", {
          encoding: "utf-8",
        })
      );
  } else {
    resp
      .status(200)
      .send(
        readFileSync("./htmls-en/apps/navigation-tomaruKun.html", {
          encoding: "utf-8",
        })
      );
  }
});

//hazard map page
app.get("/apps/hazardMap", (req, resp) => {
  const activeTokens = JSON.parse(
    readFileSync("./jsons/activeTokens.json", { encoding: "utf-8" })
  );
  if (!(req.query.token in activeTokens)) {
    resp.redirect("/login");
    console.log("token doesn't exist");
    return;
  }
  if (activeTokens[req.query.token]["due"] <= Date.now()) {
    delete activeTokens[req.query.token];
    3;
    writeFileSync("./jsons/activeTokens.json", JSON.stringify(activeTokens));
    resp.redirect("/login");
    console.log("token expired");
    return;
  }
  const lang = req.query["lang"];
  resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  resp.setHeader("Pragma", "no-cache");
  resp.setHeader("Expires", "0");
  if (lang == "en") {
    resp
      .status(200)
      .send(
        readFileSync("./htmls-en/apps/hazardMap.html", { encoding: "utf-8" })
      );
  } else if (lang == "ja") {
    resp
      .status(200)
      .send(readFileSync("./htmls/apps/hazardMap.html", { encoding: "utf-8" }));
  } else {
    resp
      .status(200)
      .send(
        readFileSync("./htmls-en/apps/hazardMap.html", { encoding: "utf-8" })
      );
  }
});
app.get("/apps/hazardMap/getDangerLocations", (req, resp) => {
  const dangerLocations = JSON.parse(
    readFileSync("./jsons/dangerLocations.json", { encoding: "utf-8" })
  );
  resp.setHeader("Content-Type", "application/json");
  resp.end(JSON.stringify(dangerLocations));
});

//rating page
app.get("/apps/rate", (req, resp) => {
  const activeTokens = JSON.parse(
    readFileSync("./jsons/activeTokens.json", { encoding: "utf-8" })
  );
  if (!(req.query.token in activeTokens)) {
    resp.redirect("/login");
    console.log("token doesn't exist");
    return;
  }
  if (activeTokens[req.query.token]["due"] <= Date.now()) {
    delete activeTokens[req.query.token];
    3;
    writeFileSync("./jsons/activeTokens.json", JSON.stringify(activeTokens));
    resp.redirect("/login");
    console.log("token expired");
    return;
  }
  const lang = req.query["lang"];
  resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  resp.setHeader("Pragma", "no-cache");
  resp.setHeader("Expires", "0");
  if (lang == "en") {
    resp
      .status(200)
      .send(readFileSync("./htmls-en/apps/rate.html", { encoding: "utf-8" }));
  } else if (lang == "ja") {
    resp
      .status(200)
      .send(readFileSync("./htmls/apps/rate.html", { encoding: "utf-8" }));
  } else {
    resp
      .status(200)
      .send(readFileSync("./htmls-en/apps/rate.html", { encoding: "utf-8" }));
  }
});
app.post("/apps/rate/submitRating", (req, resp) => {
  const goodPoints = req.body.goodPoints;
  const badPoints = req.body.badPoints;

  ratings = JSON.parse(
    readFileSync("./jsons/userRatings.json", { encoding: "utf-8" })
  );
  ratings[ratings.length] = { good: goodPoints, bad: badPoints };
  writeFile("./jsons/userRatings.json", JSON.stringify(ratings), (err) => {
    if (err) console.log(err);
  });
  sendEmailMultiple(
    ["maetaka-2022066@edu-g.gsn.ed.jp", "maetaka-2023104@edu-g.gsn.ed.jp"],
    "rating was sent",
    `良い点: ${goodPoints}\n改善点: ${badPoints}`
  );
  resp.status(200).send();
});

function getDistanceOnEarth(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function deleteOldTokens() {
  tokens = JSON.parse(
    readFileSync("./jsons/activeTokens.json", { encoding: "utf-8" })
  );
  updated = {};
  for (token in tokens) {
    if (tokens[token]["due"] >= Date.now()) {
      updated[token] = { due: tokens[token]["due"] };
    }
  }
  writeFileSync("./jsons/activeTokens.json", JSON.stringify(updated));
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function sendCode(toEmailAddress, username, verificationCode, message) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "chalinavimailer@gmail.com",
      pass: "pqntqgngxjteqber",
    },
  });

  const mailOptions = {
    from: "chalinavimailer@gmail.com",
    to: toEmailAddress,
    subject: `Email verification for ${username}`,
    text: `${message}\nHere's the verification code: ${verificationCode}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

function sendEmail(toEmailAddress, subject, content) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "chalinavimailer@gmail.com",
      pass: "pqntqgngxjteqber",
    },
  });

  const mailOptions = {
    from: "chalinavimailer@gmail.com",
    to: toEmailAddress,
    subject: subject,
    text: content,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}
function sendEmailMultiple(toEmailAddresses, subject, content) {
  for (const addr in toEmailAddresses) {
    sendEmail(toEmailAddresses[addr], subject, content);
  }
}

module.exports = app;
