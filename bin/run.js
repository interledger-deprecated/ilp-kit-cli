#!/usr/bin/env node
'use strict'

const fs = require('fs')
const childProcess = require('child_process')
const path = require('path')
const base64url = require('base64url')
const commander = require('commander')

commander
  .version('2.0.0')
  .arguments('<plugins...>')
  .parse(process.argv)

const plugins = commander.args
if (plugins.length < 2) {
  commander.outputHelp()
  console.error('Must enter at least two plugin configs.')
  process.exit(1)
}

const defaultSet = (field, value) => {
  process.env[field] = process.env[field] || value
}

const getAllPairs = (ledgers) => {
  let pairs = []
  for (let sender of ledgers) {
    for (let receiver of ledgers) {
      if (sender !== receiver) {
        pairs.push([sender, receiver])
      }
    }
  }
  return pairs
}

defaultSet('CONNECTOR_HOSTNAME', 'localhost')
defaultSet('CONNECTOR_PORT', 4000)
defaultSet('CONNECTOR_BACKEND', 'one-to-one')

let ledgers = []
let configs = {}

for (let ledgerFile of plugins) {
  if (!fs.existsSync(ledgerFile)) {
    console.error('File "' + ledgerFile + '" does not exist.')
    process.exit(1)
  }

  let ledger = require(process.cwd() + '/' + ledgerFile)

  ledgers.push(ledger.asset + '@' + ledger.id)
  configs[ledger.id] = ledger

  if (ledger.type === 'virtual' && ledger.token) {
    let token = ledger.token
    if (typeof ledger.token === 'object') {
      token = base64url(JSON.stringify(ledger.token))
    }

    console.log('Token for ' + ledger.id + ' is: ' + token)
  }
}

defaultSet('CONNECTOR_LEDGERS', JSON.stringify(ledgers))
defaultSet('CONNECTOR_CREDENTIALS', JSON.stringify(configs))
defaultSet('CONNECTOR_PAIRS', JSON.stringify(getAllPairs(ledgers)))

defaultSet('DEBUG', 'connection,ilp-*,rpc')

childProcess.execFileSync(path.join(__dirname, '../src/run.sh'), {
  stdio: [ process.stdout, process.stderr, process.stdin ]
})
