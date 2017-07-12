#!/bin/bash

DIR=`dirname $0`
cd $DIR

java -jar -Dwebdriver.gecko.driver=./chromedriver selenium-server-standalone-3.0.1.jar
