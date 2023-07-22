import requests as req
import time

interval = 60 * 13

while True:
    resp = req.get("https://chalinavi.onrender.com/login")
    print(f"server responded with a status code of {resp.status_code}")
    time.sleep(interval)