#!/usr/bin/env node
'use strict'

const commander = require('commander')
const co = require('co')

const configure = require('../src/configure')
const key = require('../src/key')
//const addPeer = require('../src/addPeer')
//const removePeer = require('../src/removePeer')

const handle = (p) => {
  p.catch((e) => {
    console.error(e)
    process.exit(1)
  })
}

commander
  .version('3.0.0')
  .command('key')
  .action(() => {
    handle(co(key))
  })

commander
  .command('configure [file]')
  .action((file) => {
    handle(co.wrap(configure)(file))
  })

/*
commander
  .command('add-peer [file]')

commander
  .command('remove-peer [file]') 
*/

commander.parse(process.argv)
