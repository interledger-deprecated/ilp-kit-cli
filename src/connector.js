const inquirer = require('inquirer')
const valid = require('./validate')

const askConnectorQuestions = function * () {
  return yield inquirer.prompt([
    // CONNECTOR_PEERS
    { type: 'input',
      name: 'peers',
      message: 'Give the HTTP addresses of any connectors you wish to peer with (comma-separated list)',
      validate: valid.validatePeers,
      filter: (s) => (s.replace(/\s*,\s*/g, ',')),
      default: '' },

    // CONNECTOR_MAX_HOLD_TIME
    { type: 'input',
      name: 'hold',
      message: 'What is the maximum time you will put funds on hold (in seconds)?',
      validate: valid.validateNumber,
      default: '100' },

    // CONNECTOR_LOG_LEVEL
    { type: 'list',
      name: 'verbosity',
      message: 'What level of verbosity would you like?',
      default: 'info',
      choices: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] },

    // number of plugins
    { type: 'input',
      name: 'number',
      message: 'How many ledger connections (plugins) will your connector have?',
      validate: valid.validateNumber,
      default: '2' }
  ])
}

module.exports = askConnectorQuestions
