#!/bin/bash

DIR=`dirname $0`
cd $DIR


echo "Downloading selenium..."
echo

curl -O http://selenium-release.storage.googleapis.com/3.0/selenium-server-standalone-3.0.1.jar

echo
echo "You're going to have to install chrome yourself, as it is platform dependent."
echo "Get chrome driver version 2.25"
echo "And move it to test/chromedriver so that when you run selenium-server.sh it can find the driver"
