import socket
import time
import threading 
import os

def sendhuge(client, data) -> None:
    length = len(data)
    client.send(f"{length}\n".encode("ascii"))
    client.sendall(data)

def recvhuge(client) -> bytes:
    startTime = time.perf_counter()
    length = b""
    while True:
        if client.recv(1, socket.MSG_PEEK) == 0:
            continue
        recved = client.recv(1)
        if recved == b'\n':
            break
        length += recved
    length = int(length)
    recved = b''
    while True:
        recved += client.recv(length - len(recved))
        if len(recved) == length:
            break
        precentage = len(recved)/(length/100)
        print(f"\r{round(precentage, 1)} %", end="")
    endTime = time.perf_counter()
    print(f"\r100.0 %  in {round(endTime - startTime, 3)}s")
    return recved

def recvfile(client, path) -> int:
    startTime = time.perf_counter()
    length = b""
    while True:
        if client.recv(1, socket.MSG_PEEK) == 0:
            continue
        recved = client.recv(1)
        if recved == b'\n':
            break
        length += recved
    length = int(length)
    file = open(path, "wb")
    totalLength = 0
    while True:
        packet = client.recv(length - totalLength)
        file.write(packet)
        totalLength += len(packet)
        if totalLength == length:
            break
        precentage = totalLength/(length/100)
        print(f"\r{round(precentage, 1)} %", end="")
    endTime = time.perf_counter()
    print(f"\rreceived {length} bytes in {round(endTime - startTime, 3)}s")
    return length

def sendfile(client, path):
    with open(path, "rb") as f:
        sendhuge(client, f.read())


def handleClient(client):
    filename = recvhuge(client).decode("utf-8")
    recvfile(client, os.path.join("receivedFiles", filename))
    print(f"received {filename}")
    client.close()

ip = input("ip: ")
port = int(input("port: "))

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind((ip, port))
server.listen()
while True:
    client, address = server.accept()
    thread = threading.Thread(target=handleClient, args=(client,))
    thread.start()