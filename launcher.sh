#!/usr/bin/env sh
if [ ! -x './sender.py' ]
then
	chmod u+x ./sender.py
fi
./sender.py
if [ ! -x './nw' ]
then
	chmod u+x ./nw
fi
./nw $* &
