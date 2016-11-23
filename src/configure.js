const inquirer = require('inquirer')
const fs = require('fs')
const co = require('co')
const chalk = require('chalk')
const crypto = require('crypto')

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

module.exports = co.wrap(function * (output) {
  const env = {}

  if (typeof output !== 'string') {
    commander.outputHelp()
    console.error('Missing output file. Specify an env file to output to with "-o" or "--output"')
    process.exit(1)
  } else if (fs.existsSync(output)) {
    printInfo('Will overwrite "' + output + '". Cancel now if you aren\'t ok with that.')
  }

  // start asking the questions
  printHeader('ILP-Kit Configuration')
  printInfo('This section covers the configuration of your ledger and web UI. If you want to configure advanced options like mailgun configuration (to send verification emails) or github oath login, edit ' + output + ' after running this program.')
  const wallet = yield askWalletQuestions(env)

  printHeader('Connector Configuration')
  printInfo('Your connector is what gets you linked up to the rest of the Interledger. You\'ll need an account on at least one ledger that isn\'t your own in order for your connector to trade between the two ledgers. If you don\'t have any accounts right now then that\'s ok; you can enter placeholder credentials and register the account later.')

  const ledgers = {}
  const connector = yield askConnectorQuestions(env)
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
  env.API_GITHUB_CLIENT_ID = wallet.github_id || ''
  env.API_GITHUB_CLIENT_SECRET = wallet.github_secret || ''
  env.API_HOSTNAME = wallet.hostname
  env.API_MAILGUN_API_KEY = wallet.mailgun_api_key || ''
  env.API_MAILGUN_DOMAIN = wallet.mailgun_domain || ''
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
  env.LEDGER_PRECISION = '10'
  env.LEDGER_RECOMMENDED_CONNECTORS = ''

  env.CONNECTOR_ENABLE = 'true'
  env.CONNECTOR_LEDGERS = JSON.stringify(ledgers)
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

})
