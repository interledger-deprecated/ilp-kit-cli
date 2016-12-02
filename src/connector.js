const inquirer = require('inquirer')
const valid = require('./validate')
const chalk = require('chalk')
const crypto = require('crypto')
const password = require('./password')

const askConnectorQuestions = function * (env) {
  return yield inquirer.prompt([
    // connector account
    { type: 'input',
      name: 'username',
      message: 'What\'s your username (or what username will you have) on your own ledger?',
      validate: valid.validateAccount,
      default: 'me' },

    // connector password
    { type: 'input',
      name: 'password',
      message: 'What is (or will be) the password to this account? (min. 5 characters)',
      validate: (a) => (a.length >= 5),
      default: password() }
  ])
}

module.exports = askConnectorQuestions
