const inquirer = require('inquirer')
const chalk = require('chalk')
const valid = require('./validate')

const pluginQuestions = [
  // the plugin account URI
  { type: 'input',
    name: 'account',
    message: 'What is the URI for your account on this ledger?',
    default: 'https://red.ilpdemo.org/ledger/accounts/test' },

  // the plugin password
  { type: 'input',
    name: 'password',
    message: 'What is your password?',
    default: 'testtest' },

  { type: 'input',
    name: 'ledger',
    message: 'What is the ledger\'s ILP address?',
    validate: valid.validatePrefix,
    default: 'ilpdemo.red.' },

  { type: 'input',
    name: 'currency',
    message: 'What is the ledger\'s currency code?',
    validate: valid.validateCurrency,
    default: 'USD' }
]

const askPluginQuestions = function * () {
  const answers = yield inquirer.prompt(pluginQuestions)
  const username = (/^.*\/(.+)$/).exec(answers.account)[1]

  return {
    key: answers.ledger,
    plugin: 'ilp-plugin-bells',
    currency: answers.currency,
    options: {
      username: username,
      password: answers.password,
      account: answers.account,
      ledger: answers.ledger
    }
  }
}

module.exports = askPluginQuestions
