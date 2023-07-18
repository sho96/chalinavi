import socket
import os

def sendhuge(client, data):
    length = len(data)
    client.send(f"{length}\n".encode("ascii"))
    client.sendall(data)

def recvhuge(client):
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
        recved += client.recv(4096)
        if len(recved) == length:
            break
        precentage = len(recved)/length*100
        print(f"\r{precentage} %", end="")
    return recved
def recvfile(client, path):
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
        packet = client.recv(4096)
        file.write(packet)
        totalLength += len(packet)
        if totalLength == length:
            break
        precentage = totalLength/length*100
        print(f"\r{precentage} %", end="")
    return recved

while True:
    send = input("send or receive s/r\n->") == "s"
    if send:
        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        ip, port = input("ip: "), int(input("port: "))
        server.bind((ip, port))
        server.listen()
        path = input("path: ")
        client, address = server.accept()
        print(address[0], "connected")
        with open(path, "rb") as f:
            sendhuge(client, f.read())
        server.close()
    else:
        client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        ip, port = input("ip: "), int(input("port: "))
        client.connect((ip, port))
        print("connected")
        location = input("target location: ")
        if os.path.split(location)[0] == "":
            recvfile(client, location)
        else:
            recvfile(client, location)
        client.close()