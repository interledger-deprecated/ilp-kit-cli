#!/usr/bin/env node
'use strict'

const commander = require('commander')
const co = require('co')
const chalk = require('chalk')

const configure = require('../src/configure')
const key = require('../src/key')
const addPeer = require('../src/add_peer')
const removePeer = require('../src/remove_peer')
const listPeer = require('../src/list_peer')

const handle = (p) => {
  p.catch((e) => {
    console.error(e)
    process.exit(1)
  })
}

commander
  .version('3.0.0')
  .command('key')
  .description('generate a public key from a secret (or from a random string)')
  .action(() => {
    handle(co(key))
  })

commander
  .command('configure [file]')
  .description('follow step-by-step instructions to generate a complete ilp-kit configuration')
  .action((file) => {
    handle(co.wrap(configure)(file))
  })

commander
  .command('peer [file]')
  .description('using an MQTT broker and a peer\'s public key, connect your connector to them')
  .action((file) => {
    handle(co.wrap(addPeer)(file))
  })

commander
  .command('unpeer [file]') 
  .description('delete one of the plugins in your configuration file')
  .action((file) => {
    handle(co.wrap(removePeer)(file))
  })

commander
  .command('list [file]') 
  .description('list peers in your configuration file.')
  .action((file) => {
    handle(co.wrap(listPeer)(file))
  })

const argv = process.argv
const argc = argv.slice(2).length
if (!argc) {
  commander.outputHelp()
  process.exit(1)
} else if (argc === 1 && argv[2] !== 'key') {
  console.info(chalk.grey('Using "env.list" as default file.'))
  argv.push('env.list')
}

commander
  .parse(argv)
