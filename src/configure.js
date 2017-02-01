const inquirer = require('inquirer')
const fs = require('fs')
const co = require('co')
const chalk = require('chalk')
const crypto = require('crypto')
const base64url = require('base64url')
const password = require('./password')

const currency = require('../src/currency.js')
const askWalletQuestions = require('../src/wallet.js')
const parse = require('../src/parse.js')

const backupFile = (original) => {
  const now = new Date()
  return original +
    '.' + now.getFullYear() +
    '-' + now.getMonth() +
    '-' + now.getDate() +
    '-' + now.getHours() +
    '-' + now.getMinutes() +
    '-' + now.getSeconds() +
    '.bak'
}

// Text formatting functions
const printHeader = (s) => {
  console.log()
  console.log(chalk.yellow(s))
}
const printInfo = (s) => {
  console.info(chalk.gray(s))
}
const printWarning = (s) => {
  console.info(chalk.red(s))
}

module.exports = co.wrap(function * (output) {
  const env = {}

  if (typeof output !== 'string') {
    console.error('Missing output file. Use \'--help\' for options.')
    process.exit(1)
  } else if (fs.existsSync(output)) {
    const bak = backupFile(output)

    printWarning('Backing up ' + output + ' at ' + bak)
    fs.createReadStream(output).pipe(fs.createWriteStream(bak))

    yield parse(output, function * (key, value) {
      env[key] = value
    }, true) // don't modify the file
  }

  // start asking the questions
  printHeader('ILP-Kit Configuration')
  printInfo('This section covers the configuration of your ledger and web UI. If you want to configure advanced options like mailgun configuration (to send verification emails) or github oath login, edit ' + output + ' after running this program.')
  const wallet = yield askWalletQuestions(env)

  const ledgers = {}
  const name = wallet.name
  const title = name.charAt(0).toUpperCase() + name.split('').slice(1).join('')
  const prefix = wallet.country.toLowerCase()
    + '.' + wallet.currency.toLowerCase()
    + '.' + name.toLowerCase()
    + '.'

  const connectorUsername = (env.LEDGER_RECOMMENDED_CONNECTORS || '').split(',')[0] || 'connector'
  const connectorPassword = (
    env.CONNECTOR_LEDGERS &&
    JSON.parse(env.CONNECTOR_LEDGERS)[env.LEDGER_ILP_PREFIX] &&
    JSON.parse(env.CONNECTOR_LEDGERS)[env.LEDGER_ILP_PREFIX].options.password
  ) || password()

  ledgers[prefix] = {
    currency: wallet.currency,
    plugin: 'ilp-plugin-bells',
    options: {
      account: 'https://' + wallet.hostname + '/ledger/accounts/' + connectorUsername,
      username: connectorUsername,
      password: connectorPassword
    }
  }  

  // assign all the environment variables
  env.DB_URI = wallet.db_uri
  env.API_EMAIL_SENDER_NAME = title
  env.API_EMAIL_SENDER_ADDRESS = 'ilpkit@' + wallet.hostname
  env.API_GITHUB_CLIENT_ID = wallet.github_id || ''
  env.API_GITHUB_CLIENT_SECRET = wallet.github_secret || ''
  env.API_HOSTNAME = wallet.hostname
  env.API_MAILGUN_API_KEY = wallet.mailgun_api_key || ''
  env.API_MAILGUN_DOMAIN = wallet.mailgun_domain || ''
  env.API_PORT = env.API_PORT || '3100'
  env.API_PRIVATE_HOSTNAME = env.API_PRIVATE_HOSTNAME || 'localhost'
  env.API_PUBLIC_HTTPS = env.API_PUBLIC_HTTPS || 'true'
  env.API_PUBLIC_PATH = env.API_PUBLIC_PATH || '/api'
  env.API_PUBLIC_PORT = env.API_PUBLIC_PORT || '443'
  env.API_SECRET = env.API_SECRET || base64url(crypto.randomBytes(33))
  env.BLUEBIRD_WARNINGS = env.BLUEBIRD_WARNINGS || '0'
  env.CLIENT_HOST = wallet.hostname
  env.CLIENT_PORT = env.CLIENT_PORT || '3010'
  env.CLIENT_PUBLIC_PORT = env.CLIENT_PUBLIC_PORT || '443'
  env.CLIENT_TITLE = title
  env.LEDGER_ADMIN_USER = env.LEDGER_ADMIN_USER || 'admin'
  env.LEDGER_ADMIN_PASS = env.LEDGER_ADMIN_PASS || password()
  env.LEDGER_CURRENCY_CODE = wallet.currency
  env.LEDGER_CURRENCY_SYMBOL = currency[wallet.currency] || wallet.currency
  env.LEDGER_ILP_PREFIX = prefix
  env.LEDGER_PRECISION = env.LEDGER_PRECISION || '10'

  env.CONNECTOR_ENABLE = env.CONNECTOR_ENABLE || 'true'
  env.CONNECTOR_LEDGERS = JSON.stringify(ledgers)
  env.CONNECTOR_LOG_LEVEL = env.CONNECTOR_LOG_LEVEL || 'info'
  env.CONNECTOR_MAX_HOLD_TIME = env.CONNECTOR_MAX_HOLD_TIME || '100'
  env.CONNECTOR_AUTOLOAD_PEERS = env.CONNECTOR_AUTOLOAD_PEERS || 'true'
  env.CONNECTOR_PORT = env.CONNECTOR_PORT || '4000'
  env.LEDGER_RECOMMENDED_CONNECTORS = connectorUsername

  env.ILP_KIT_CLI_VERSION = require('../package.json').version

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
