#!/usr/bin/env node
'use strict'

const fs = require('fs')
const ArgumentParser = require('argparse').ArgumentParser

let parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'Create configuration files for ILP connector'
})

parser.addArgument(
  ['-i', '--input'],
  { help: 'partially filled JSON input file' }
)

parser.addArgument(
  ['-o', '--output'],
  { help: 'JSON file to put output in' }
)

parser.addArgument(
  ['-t', '--type'],
  { help: 'LedgerPlugin type for this config' }
)

let args = parser.parseArgs()

if (!args.type || !args.output) {
  parser.printHelp()
  console.error('\nYou must specify at least an output file and a type')
  process.exit(1)
}

let inputFile = args.input
let outputFile = args.output

let input = {}
if (inputFile) {
  input = require(process.cwd() + '/' + inputFile)
}

let configurations = {}

configurations.bells = (config) => {
  config.asset = config.asset || 'USD'
  config.id = config.id || 'FILL IN: ledger id URI'
  config.username = config.username || 'FILL IN: username'
  config.password = config.password || 'FILL IN: password for account'
  config.account = config.account ||
    'FILL IN: http://example.ledger/accounts/username'
  config.ledger = config.ledger ||
    'FILL IN: ledger.example.'
  config.type = 'bells'
  return config
}

configurations.virtual = (config) => {
  config.asset = config.asset || 'USD'
  config.id = config.id || 'example.virtual.'
  config.prefix = config.prefix || 'example.virtual.'
  config.username = config.username || 'doesnt matter'
  config.password = config.password || 'doesnt matter'
  config.account = config.host || 'nerd'
  config.host = config.host || 'ws://broker.hivemq.com:8000'
  config.limit = config.limit || '0'
  config.balance = config.balance || 'FILL IN: balance (number)'
  config.token = config.token ||
    require('crypto').randomBytes(16).toString('hex')
  config.secret = config.secret ||
//  require('crypto').randomBytes(128).toString('base64')
    'not used yet'
  config.store = config.store || process.cwd() + '/store.db'
  config.info = config.info || {
    currencyCode: 'USD',
    currencySymbol: '$',
    precision: 15,
    scale: 15
  }
  config.type = 'virtual'
  return config
}

configurations.eth = (config) => {
  // placeholders for now
  config.asset = config.asset || 'Placeholder'
  config.id = config.id || 'Placeholder'
  config.username = config.username || 'Placeholder'
  config.password = config.password || 'Placeholder'
  config.account = config.account || 'Placeholder'
  config.type = 'eth'
  return config
}

let output = configurations[args.type](input)
// enable pretty printing
fs.writeFileSync(outputFile, JSON.stringify(output, null, 2) + '\n')
