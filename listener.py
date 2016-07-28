#!/usr/bin/env python
# coding=utf-8

from socket import *

sock = socket(AF_INET, SOCK_DGRAM, 0)
sock.setsockopt(SOL_SOCKET,SO_REUSEADDR,1)
sock.bind(("", 13013))
sock.recvfrom(0)
sock.close()
