const inquirer = require('inquirer')
const crypto = require('crypto')
const valid = require('./validate')
const chalk = require('chalk')

const askWalletQuestions = function * (env) {
  return yield inquirer.prompt([
    // API_DB_URI
    { type: 'input',
      name: 'db_uri',
      message: 'What is the address of your postgres DB?',
      default: env.API_DB_URI || 'postgres://user:pass@localhost/ilpkit' },

    // domain
    { type: 'input',
      name: 'hostname',
      message: 'What is the hostname that you\'ll be running on?',
      validate: valid.validatePeers,
      default: env.CLIENT_HOST || 'red.ilpdemo.org' },

    // name
    { type: 'input',
      name: 'name',
      message: 'What is your ledger called?',
      validate: valid.validateAccount,
      default: (answers) => answers.hostname.split('.')[0] },

    // LEDGER_CURRENCY_CODE
    { type: 'input',
      name: 'currency',
      message: 'What is your ledger\'s currency code?',
      validate: valid.validateCurrency,
      default: env.LEDGER_CURRENCY_CODE || 'USD' }, 

    // country code
    { type: 'input',
      name: 'country',
      message: 'What is your country code?',
      validate: valid.validateCountry,
      default: env.LEDGER_CURRENCY_CODE || 'US' }
  ])
}

module.exports = askWalletQuestions
