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
  printHeader('ILP-Kit Configuration')
  const wallet = yield askWalletQuestions()

  const ledgers = {}
  let connector = {}

  if (wallet.connector) {
    printHeader('Connector Configuration')
    connector = yield askConnectorQuestions()
    const numPlugins = connector.number

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
  }

  // confirm before writing file
  printHeader('Output')

  // assign all the environment variables
  const env = {}
  env.API_DB_URI = wallet.db_uri
  env.API_GITHUB_CLIENT_ID = wallet.github_id
  env.API_GITHUB_CLIENT_SECRET = wallet.github_secret
  env.API_HOSTNAME = wallet.hostname
  env.API_MAILGUN_API_KEY = wallet.mailgun_api_key
  env.API_MAILGUN_DOMAIN = wallet.mailgun_domain
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
  env.LEDGER_ADMIN_NAME = wallet.admin_name
  env.LEDGER_ADMIN_PASS = wallet.admin_pass
  env.LEDGER_CURRENCY_CODE = wallet.ledger_currency_code
  env.LEDGER_CURRENCY_SYMBOL = '\'' + wallet.ledger_currency_symbol + '\''
  env.LEDGER_ILP_PREFIX = wallet.ledger_ilp_prefix
  env.LEDGER_RECOMMENDED_CONNECTORS = ''

  if (wallet.connector) {
    env.CONNECTOR_ENABLE = wallet.connector ? 'true' : null
    env.CONNECTOR_LEDGERS = '\'' + JSON.stringify(ledgers) + '\''
    env.CONNECTOR_LOG_LEVEL = connector.verbosity
    env.CONNECTOR_MAX_HOLD_TIME = connector.hold
    env.CONNECTOR_PEERS = connector.peers
    env.CONNECTOR_PORT = '4000'
  }

  if (ledgers[wallet.ledger_ilp_prefix]) {
    env.LEDGER_RECOMMENDED_CONNECTORS =
      ledgers[wallet.ledger_ilp_prefix].options.username
  }

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
