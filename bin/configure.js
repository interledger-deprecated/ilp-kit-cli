#!/usr/bin/env node
'use strict'

const fs = require('fs')
const commander = require('commander')
const inquirer = require('inquirer')
const co = require('co')
const chalk = require('chalk')
const crypto = require('crypto')

const askPluginQuestions = require('../src/plugin.js')
const askConnectorQuestions = require('../src/connector.js')
const currency = require('../src/currency.js')
const askWalletQuestions = require('../src/wallet.js')
const parseExisting = require('../src/parse.js')

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
const env = {}

if (typeof output !== 'string') {
  commander.outputHelp()
  console.error('Missing output file. Specify an env file to output to with "-o" or "--output"')
  process.exit(1)
} else if (fs.existsSync(output)) {
  printInfo('Will load defaults from "' + output + '", then overwrite. Cancel now if you aren\'t ok with that.')
  // Object.assign(env, parseExisting(output))
}

// start asking the questions
co(function * () {
  printHeader('ILP-Kit Configuration')
  printInfo('This section covers the configuration of your ledger and web UI. If you want to configure advanced options like mailgun configuration (to send verification emails) or github oath login, edit ' + output + ' after running this program.')
  const wallet = yield askWalletQuestions(env)

  printHeader('Connector Configuration')
  printInfo('Your connector is what gets you linked up to the rest of the Interledger. You\'ll need an account on at least one ledger that isn\'t your own in order for your connector to trade between the two ledgers. If you don\'t have any accounts right now then that\'s ok; you can enter placeholder credentials and register the account later.')
  const connector = yield askConnectorQuestions(env)
  
  const ledgers = {}
  let plugin
  do {
    printHeader('Plugin #' + (Object.keys(ledgers).length + 1))
    printInfo('A plugin is your connection to an individual ledger. It needs your credentials on that ledger to get you connected.')
    plugin = yield askPluginQuestions(connector)
    ledgers[plugin.prefix] = {
      plugin: 'ilp-plugin-bells',
      currency: plugin.currency,
      options: {
        identifier: plugin.identifier,
        password: plugin.password
      } 
    }
  } while (plugin.another === true)

  // compile all of the user input into a useful file
  printHeader('Output')

  const name = wallet.name
  const prefix = wallet.country.toLowerCase()
    + '.' + wallet.currency.toLowerCase()
    + '.' + name.toLowerCase()
    + '.'

  ledgers[prefix] = {
    currency: wallet.currency,
    plugin: 'ilp-plugin-bells',
    options: {
      account: 'https://' + wallet.hostname + '/ledger/accounts/' + connector.username,
      password: connector.password
    }
  }

  // assign all the environment variables
  env.API_DB_URI = wallet.db_uri
  env.API_GITHUB_CLIENT_ID = ''
  env.API_GITHUB_CLIENT_SECRET = ''
  env.API_HOSTNAME = wallet.hostname
  env.API_MAILGUN_API_KEY = ''
  env.API_MAILGUN_DOMAIN = ''
  env.API_PORT = '3100'
  env.API_PRIVATE_HOSTNAME = 'localhost'
  env.API_PUBLIC_HTTPS = '1'
  env.API_PUBLIC_PATH = '/api'
  env.API_PUBLIC_PORT = '443'
  env.API_SECRET = crypto.randomBytes(33).toString('base64')
  env.BLUEBIRD_WARNINGS = '0'
  env.CLIENT_HOST = wallet.hostname
  env.CLIENT_PORT = '3010'
  env.CLIENT_PUBLIC_PORT = '443'
  env.CLIENT_TITLE = name.charAt(0).toUpperCase() + name.split('').slice(1).join('')
  env.LEDGER_ADMIN_USER = 'admin'
  env.LEDGER_ADMIN_PASS = crypto.randomBytes(18).toString('base64')
  env.LEDGER_CURRENCY_CODE = wallet.currency
  env.LEDGER_CURRENCY_SYMBOL = currency[wallet.currency] || wallet.currency
  env.LEDGER_ILP_PREFIX = prefix
  env.LEDGER_RECOMMENDED_CONNECTORS = ''

  env.CONNECTOR_ENABLE = 'true'
  env.CONNECTOR_LEDGERS = JSON.stringify(ledgers).replace(/'/g, '\'\\\'\'')
  env.CONNECTOR_LOG_LEVEL = 'info'
  env.CONNECTOR_MAX_HOLD_TIME = '100'
  env.CONNECTOR_PEERS = connector.peers
  env.CONNECTOR_PORT = '4000'
  env.LEDGER_RECOMMENDED_CONNECTORS = connector.username

  // write the environment to a docker-compatible env-file
  printInfo('Writing enviroment to "' + output + '"...')
  fs.writeFileSync(
    output,
    Object.keys(env).reduce((out, key) => (
      (out + key + '=' + env[key] + '\n')
    ), '')
  )
  printInfo('Done.')

}).catch((e) => {
  console.error(e)
  process.exit(1)
})
