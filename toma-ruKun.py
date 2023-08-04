import requests as req
import json
from threading import Thread
from hashlib import sha256
import time
import cv2

tomaruName = "toma-ruKun"
password = sha256(b"abcdefg").hexdigest()

currentState = "---"

baseurl = "https://chalinavi.onrender.com"
#baseurl = "http://192.168.0.13:15243"

def brake():
    print("braking")

def takePic():
    #take a picture here with opencv format
    return "~~~ frame ~~~"


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
    while True:
        time.sleep(2)
        token = jsonGET(f"/tomaru-kun/unlinked/getMessage?name={tomaruName}&type=token")["message"]
        if token == "":
            continue
        verification = input(f"is this you trying to connect? (y/n): {token}\n->")
        if verification == "y":
            #verified
            print("verified")
            jsonPOST(f"/tomaru-kun/unlinked/setMessage", {"name": tomaruName, "message": {"status": "verified"}})
            Thread(target=main).start()
            break
        else:
            #denied
            print("denied")
            jsonPOST(f"/tomaru-kun/unlinked/setMessage", {"name": tomaruName, "message": {"status": "denied"}})

def main():
    global currentState
    currentState = "main"
    Thread(target=updateTomaruTimestamp, args=("linked",)).start()
    connected = True
    while connected:
        time.sleep(1)
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
                picture = cv2.imencode(".jpg", takePic())[1]
                file = {"file": (f"{picname}.jpg", picture.tobytes(), "image/jpeg")}
                req.post("http://106.155.187.46:15243/tomaru-kun/linked/sendPic", files=file)
            if cmd == "disconnect":
                jsonPOST("/tomaru-kun/linked/disconnect", {"name": tomaruName, "password": password})
                connected = False
    startFlow()

def startFlow():
    global currentState
    currentState = "registering"
    jsonPOST("/tomaru-kun/unlinked/register", {"name": tomaruName, "password": password})
    Thread(target=waitForConnection).start()

startFlow()

while True:
    pass
