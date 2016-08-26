#!/bin/bash

cd $(dirname $0)/../node_modules/five-bells-connector
DEBUG="connection,connection:err,ilp-plugin-virtual,ilp-plugin-virtual:err" npm start
