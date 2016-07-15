#!/usr/bin/env python
# coding=utf-8

from socket import *

sock = socket(AF_INET, SOCK_DGRAM, 0)
sock.sendto(bytes(0), ("", 13013))
