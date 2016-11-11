const inquirer = require('inquirer')
const valid = require('./validate')

const askPluginQuestions = (connector) => inquirer.prompt([
  // the plugin identifier
  { type: 'input',
    name: 'identifier',
    message: 'Give the webfinger identifier of an account you own:',
    validate: valid.validateIdentifier,
    default: connector.username + '@red.ilpdemo.org' },

  // the currency
  { type: 'input',
    name: 'currency',
    message: 'What currency is traded on this ledger?',
    validate: valid.validateCurrency,
    default: 'USD' },

  // the country
  { type: 'input',
    name: 'country',
    message: 'What country does this ledger operate in?',
    validate: valid.validateCountry,
    default: (a) => (a.currency.substring(0, 2).toLowerCase()) },

  // the ilp prefix
  { type: 'input',
    name: 'prefix',
    message: 'What\'s the ILP address of this ledger?',
    validate: valid.validatePrefix,
    default: (a) => ('us.' + a.currency.toLowerCase() + '.' + (a.identifier.split('@')[1].split('.')[0]) + '.') },

  // the plugin password
  { type: 'input',
    name: 'password',
    validate: (v) => (v.length >= 5),
    message: 'What is the password of this account? (min 5 characters)',
    default: 'password' },

  // another?
  { type: 'confirm',
    name: 'another',
    message: 'Enter another plugin?',
    default: false }
])

module.exports = askPluginQuestions
