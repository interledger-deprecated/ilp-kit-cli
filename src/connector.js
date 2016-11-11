const inquirer = require('inquirer')
const valid = require('./validate')
const chalk = require('chalk')
const crypto = require('crypto')

const askConnectorQuestions = function * (env) {
  return yield inquirer.prompt([
    // CONNECTOR_PEERS
    { type: 'input',
      name: 'peers',
      message: 'If you want to broadcast your routes to people, you\'ll have to peer with them. Give the ILP addresses of any connectors you wish to peer with (comma-separated list). You can leave this blank for now if you want.',
      validate: valid.validatePeers,
      filter: (s) => (s.replace(/\s*,\s*/g, ',')),
      default: env.CONNECTOR_PEERS || '' },

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
      default: crypto.randomBytes(18).toString('base64') }
  ])
}

module.exports = askConnectorQuestions
