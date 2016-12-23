#!/usr/bin/env node
'use strict'

const commander = require('commander')
const co = require('co')
const chalk = require('chalk')
const configure = require('../src/configure')

const handle = (p) => {
  p.catch((e) => {
    console.error(e)
    process.exit(1)
  })
}

commander
  .usage('[file]')
  .description('follow step-by-step instructions to generate a complete ilp-kit configuration')
  .action((file) => {
    handle(co.wrap(configure)(file))
  })

const argv = process.argv
const argc = argv.slice(2).length
if (argc > 1) { 
  commander.outputHelp()
  process.exit(1)
}

console.info(chalk.grey('Using "env.list" as default file.'))
argv.push('env.list')

commander
  .parse(argv)
