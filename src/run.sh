#!/bin/bash

cd $(dirname $0)/../node_modules/five-bells-connector
DEBUG=connection,connection:err,plugin,plugin:err npm start
