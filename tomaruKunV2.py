import requests as req
import json
from threading import Thread
from hashlib import sha256
import time
import cv2
import numpy as np
#import RPi.##GPIO as ##GPIO

##GPIO.setmode(#GPIO.BOARD)

tomaruName = "toma-ruKun"
password = sha256(b"abcdefg").hexdigest()

currentState = "---"

baseurl = "https://chalinavi.onrender.com"
imgServerUrl = "http://106.155.187.46:32415"

acceptButton = 15
rejectButton = 13
statusLed = 11

#GPIO.setup(acceptButton, #GPIO.IN)
#GPIO.setup(rejectButton, #GPIO.IN)
#GPIO.setup(statusLed, #GPIO.OUT)

camera = cv2.VideoCapture(0)
ret, frame = camera.read()

def blinkLed(pin, interval, cycles):
    for _ in range(cycles):
        #GPIO.output(pin, True)
        time.sleep(interval)
        #GPIO.output(pin, False)
        time.sleep(interval)

def brake():
    print("braking")

def takePic():
    ret, frame = camera.read()
    if not ret:
        return np.zeros((100, 100, 3), dtype=np.uint8)
    return frame


def GET(url):
    resp = req.get(baseurl + url, timeout = 5)
    if resp.status_code != 200:
        return None
    return resp.content.decode("utf-8")

def jsonGET(url):
    resp = req.get(baseurl + url, timeout = 5)
    if resp.status_code != 200:
        return None
    return json.loads(resp.content.decode("utf-8"))

def POST(url, content, headers):
    req.post(baseurl + url, content, headers=headers)

def jsonPOST(url, json):
    req.post(baseurl + url, json=json)

def updateTomaruTimestamp(state):
    global currentState
    originalState = currentState
    while True:
        if currentState != originalState:
            break
        jsonPOST(f"/tomaru-kun/{state}/updateTimestamp", {"name": tomaruName})
        print("update")
        time.sleep(20)

def waitForConnection():
    global currentState
    currentState = "waitingForConnection"
    Thread(target=updateTomaruTimestamp, args=("unlinked",)).start()
    while currentState == "waitingForConnection":
        time.sleep(2)
        token = jsonGET(f"/tomaru-kun/unlinked/getMessage?name={tomaruName}&type=token")["message"]
        if token == "":
            continue
        print(token)
        print("led on")
        #GPIO.output(statusLed, True)
        answer = input("? ->")
        while True:
            accepted = answer == "y"
            denied = answer != "y"
            if accepted:
                #verified
                print("verified")
                jsonPOST(f"/tomaru-kun/unlinked/setMessage", {"name": tomaruName, "message": {"status": "verified"}})
                blinkLed(statusLed, 0.1, 3)
                Thread(target=main).start()
                currentState = "main"
                break
            if denied:
                #denied
                print("denied")
                jsonPOST(f"/tomaru-kun/unlinked/setMessage", {"name": tomaruName, "message": {"status": "denied"}})
                blinkLed(statusLed, 0.3, 3)
                break
        #GPIO.output(statusLed, False)

def main():
    global currentState
    currentState = "main"
    Thread(target=updateTomaruTimestamp, args=("linked",)).start()
    clientLastActive = time.time()*1000
    connected = True
    lastTimestamp = time.time() * 1000
    while connected:
        camera.grab()
        if lastTimestamp + 1000 > time.time() * 1000:
            continue
        lastTimestamp = time.time() * 1000
        codes = jsonGET(f"/tomaru-kun/linked/getCommand?name={tomaruName}")
        print(codes)
        for code in codes:
            parts = code.split(" ")
            parts.append("")
            cmd = parts[0]
            args = parts[1:]
            if cmd == "brake":
                brake()
            if cmd == "takePic":
                picname = args[0]
                img = takePic()
                cv2.imwrite("taken.png", img)
                picture = cv2.imencode(".jpg", img)[1]
                file = {"file": (f"{picname}.jpg", picture.tobytes(), "image/jpeg")}
                req.post(imgServerUrl + "/tomaru-kun/linked/sendPic", files=file)
            if cmd == "updateClientTimestamp":
                clientLastActive = time.time()*1000
            if cmd == "disconnect":
                jsonPOST("/tomaru-kun/linked/disconnect", {"name": tomaruName, "password": password})
                connected = False
        if clientLastActive < time.time()*1000-60000:
            jsonPOST("/tomaru-kun/linked/disconnect", {"name": tomaruName, "password": password})
            connected = False
    startFlow()

def startFlow():
    global currentState
    blinkLed(statusLed, 0.1, 3)
    currentState = "registering"
    jsonPOST("/tomaru-kun/unlinked/register", {"name": tomaruName, "password": password})
    Thread(target=waitForConnection).start()

startFlow();

while True:
    pass
