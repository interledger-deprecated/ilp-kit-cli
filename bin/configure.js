#!/usr/bin/env node
'use strict'

const fs = require('fs')
const commander = require('commander')
const inquirer = require('inquirer')
const co = require('co')
const chalk = require('chalk')

const askPluginQuestions = require('../src/plugin.js')
const askConnectorQuestions = require('../src/connector.js')
const askWalletQuestions = require('../src/wallet.js')

// Text formatting functions
const printHeader = (s) => {
  console.log()
  console.log(chalk.yellow(s))
}
const printInfo = (s) => {
  console.info(chalk.gray(s))
}

commander
  .version('2.0.0')
  .option('-o, --output <output>', 'file to output to (eg. example.list)')
  .parse(process.argv)

const output = commander.output
if (typeof output !== 'string') {
  commander.outputHelp()
  console.error('Missing output file. Specify an env file to output to with "-o" or "--output"')
  process.exit(1)
} else if (fs.existsSync(output)) {
  printInfo('Will overwrite "' + output + '". Cancel now if you aren\'t ok with that.')
}

// start asking the questions
co(function * () {
  printHeader('Wallet and Ledger Configuration')
  const wallet = yield askWalletQuestions()

  printHeader('General Connector Configuration')
  const connector = yield askConnectorQuestions()

  const numPlugins = connector.number
  const ledgers = {}

  // create each of the plugins
  for (let i = 0; i < numPlugins; ++i) {
    printHeader('Plugin ' + (i + 1) + ' Configuration')

    const ledger = yield askPluginQuestions()
    ledgers[ledger.key] = {
      plugin: ledger.plugin,
      currency: ledger.currency,
      options: ledger.options
    }
  }

  // confirm before writing file
  printHeader('Output')
  const confirmation = yield inquirer.prompt([
    { type: 'confirm',
      name: 'confirmed',
      message: 'Write these options to "' + output + '"?',
      default: 'true' }
  ])
  if (!confirmation.confirmed) {
    console.log()
    console.error('aborted by user.')
    process.exit(1)
  }

  // assign all the environment variables
  const env = {}
  env.API_DB_URI = wallet.db_uri
  env.API_ED25519_SECRET_KEY = wallet.api_ed25519
  env.API_HOSTNAME = wallet.hostname
  env.API_LEDGER_ADMIN_NAME = wallet.admin_name
  env.API_LEDGER_ADMIN_PASS = wallet.admin_pass
  env.API_PORT = '3100'
  env.API_PRIVATE_HOSTNAME = 'localhost'
  env.API_PUBLIC_HTTPS = '1'
  env.API_PUBLIC_PATH = '/api'
  env.API_PUBLIC_PORT = '443'
  env.API_SECRET = wallet.secret
  env.BLUEBIRD_WARNINGS = '0'
  env.CLIENT_HOST = wallet.hostname
  env.CLIENT_PORT = '3010'
  env.CLIENT_PUBLIC_PORT = '443'
  env.CONNECTOR_LEDGERS = JSON.stringify(ledgers)
  env.CONNECTOR_LOG_LEVEL = connector.verbosity
  env.CONNECTOR_MAX_HOLD_TIME = connector.hold
  env.CONNECTOR_PEERS = connector.peers
  env.CONNECTOR_PORT = connector.port
  env.CONNECTOR_PUBLIC_URI = connector.uri
  env.DEBUG = 'ilp*,connection,rpc'
  env.LEDGER_ED25519_SECRET_KEY = wallet.ledger_ed25519
  env.LEDGER_ILP_PREFIX = wallet.ledger_ilp_prefix
  env.LEDGER_RECOMMENDED_CONNECTORS = JSON.stringify([connector.uri + ':' + connector.port])

  // write the environment to a docker-compatible env-file
  printInfo('Writing enviroment to "' + output + '"...')
  fs.writeFileSync(
    output,
    Object.keys(env).reduce((out, key) => (
      (env[key]) ? (out + key + '=' + env[key] + '\n') : (out)
    ), '')
  )
  printInfo('Done.')
}).catch((e) => {
  console.error(e)
  process.exit(1)
})
