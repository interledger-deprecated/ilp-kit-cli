#!/usr/bin/env node
'use strict'

const path = require('path')
const fs = require('fs')
const commander = require('commander')
const inquirer = require('inquirer')
const co = require('co')
const chalk = require('chalk')

const crypto = require('crypto')
const keypairs = require('ripple-keypairs')

const validateNumber = (s) => !!s.match(/^[0-9]+$/)
const validateNegativeNumber = (s) => !!s.match(/^\-?[0-9]+$/)
const validatePrefix = (s) => !!s.match(/^[a-zA-Z0-9._~-]+\.$/)
const validateAccount = (s) => !!s.match(/^[a-zA-Z0-9_~-]+$/)
const validateRippleSecret = (s) => !!s.match(/^s[rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz]+$/)
const validatePeers = () => true
const validateUri = () => true

// Text formatting functions
const printHeader = (s) => {
  console.log()
  console.log(chalk.yellow(s))
  //console.log(chalk.gray('-'.repeat(s.length)))
}
const printInfo = (s) => {
  console.info(chalk.gray(s))
}

const pluginQuestions = {
  'ilp-plugin-virtual': [
    // the plugin asset
    { type: 'input',
      name: 'currencyCode',
      message: 'What is the asset currency code of this trustline?',
      default: 'USD' },

    // the plugin currency symbol
    { type: 'input',
      name: 'currencySymbol',
      message: 'What is the currency symbol for this trustline?',
      default: '$' },

    // the plugin precision
    { type: 'input',
      name: 'precision',
      message: 'How many significant digits can amounts on this trustline have?',
      default: '15',
      validate: validateNumber },

    // the plugin scale
    { type: 'input',
      name: 'scale',
      message: 'How many digits past the decimal point can amounts this trustline have?',
      default: '15',
      validate: validateNumber },

    // the plugin account
    { type: 'input',
      name: 'account',
      message: 'What is the account name of the nerd on this trustline?',
      default: 'nerd',
      validate: validateAccount },

    // the plugin initial balance
    { type: 'input',
      name: 'initialBalance',
      message: 'What is the initial balance of your trustline?',
      default: '5',
      validate: validateNumber },

    // the plugin's maximum balance
    { type: 'input',
      name: 'maxBalance',
      message: 'What is the maximum balance on this trustline? (the most that the nerd can owe the noob)',
      default: '10',
      validate: validateNumber },

    // plugin's minimum balance
    { type: 'input',
      name: 'minBalance',
      message: 'What is the lowest balance on this trustline? (if negative, then the noob owes the nerd)',
      default: '0',
      validate: validateNegativeNumber },

    // plugin's host
    { type: 'input',
      name: 'host',
      message: 'What is the URL of this trustline\'s MQTT host? (include the port)',
      default: 'ws://broker.hivemq.com:8000' },

    // plugin's store
    { type: 'input',
      name: 'store',
      message: 'What path would you like this trustline\'s store file to be?',
      default: path.join(process.cwd() + '/store.db') },

    // the plugin prefix (.id, .prefix)
    { type: 'input',
      name: 'prefix',
      message: 'What is the ILP prefix of this trustline?',
      default: 'example.virtual.',
      validate: validatePrefix },

    // SETTLEMENT BEGINS HERE
    { type: 'confirm',
      name: 'settleRipple',
      message: 'Would you like to configure settlement over ilp-plugin-ripple?',
      default: false },

    // ask for the server
    { type: 'input',
      name: 'settleServer',
      message: 'What is the URL of the ripple server you wish to use? (include the port)',
      default: 'wss://s.altnet.rippletest.net:51233',
      when: (a) => a.settleRipple },

    // ask for the secret
    { type: 'input',
      name: 'settleSecret',
      message: 'What is your ripple secret? (this will be stored in plaintext)',
      default: keypairs.generateSeed(),
      validate: validateRippleSecret,
      when: (a) => a.settleRipple }
  ],

  'ilp-plugin-bells': [
    // the plugin asset
    { type: 'input',
      name: 'currencyCode',
      message: 'What is the asset currency code of this ledger? (used by the connector)',
      default: 'USD' },

    // the ledger ID
    { type: 'input',
      name: 'ledger',
      message: 'What ILP address would you like this ledger to use? (used by the connector)',
      default: 'ilpdemo.red.',
      validate: validatePrefix },

    // the plugin username
    { type: 'input',
      name: 'username',
      message: 'What is your username on this Five Bells Ledger?',
      default: 'test',
      validate: validateAccount },

    // the plugin password
    { type: 'input',
      name: 'password',
      message: 'What is your password?',
      default: 'test' },

    // the plugin account URI
    { type: 'input',
      name: 'account',
      message: 'What is the URI for your account on this ledger?',
      default: 'https://red.ilpdemo.org/ledger/accounts/test' },
  ]
}

const processAnswers = {
  'ilp-plugin-virtual': (answers) => {
    let result = {
      key: answers.prefix,
      plugin: 'ilp-plugin-virtual',
      currency: answers.currencyCode,
      options: {
        prefix: answers.prefix,
        account: answers.account,
        initialBalance: answers.initialBalance,
        minBalance: answers.minBalance,
        maxBalance: answers.maxBalance,
        settleIfUnder: answers.settleIfUnder || '1',
        settleIfOver: answers.settleIfOver || '9',
        settlePercent: answers.settlePercent || '0.5',
        secret: crypto.randomBytes(16).toString('hex'),
        store: answers.store,
        info: {
          currencyCode: answers.currencyCode,
          currencySymbol: answers.currencySymbol,
          scale: answers.scale,
          precision: answers.precision
        },
        token: {
          channel: crypto.randomBytes(16).toString('hex'),
          host: answers.host
        }
      }
    }

    if (answers.settleRipple) {
      result.options._optimisticPlugin = 'ilp-plugin-ripple'
      result.options._optimisticPluginOpts = {
        type: 'ripple',
        address: keypairs.deriveAddress(keypairs.deriveKeypair(secret).publicKey),
        secret: answers.settleSecret,
        server: answers.settleServer
      }
    }

    return result
  },
  'ilp-plugin-bells': (answers) => {
    return {
      key: answers.ledger,
      plugin: 'bells',
      currency: answers.currencyCode,
      options: {
        username: answers.username,
        password: answers.password,
        account: answers.account,
        ledger: answers.ledger
      }
    }
  }
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
  // common information between plugins
  printHeader('General Connector Configuration')
  const preliminary = yield inquirer.prompt([
    // CONNECTOR_PORT
    { type: 'input',
      name: 'port',
      message: 'What port will your connector run on?',
      validate: validateNumber,
      default: '4000' },

    // CONNECTOR_PEERS
    { type: 'input',
      name: 'peers',
      message: 'Give the HTTP addresses of any connectors you wish to peer with (comma-separated list)',
      validate: validatePeers,
      filter: (s) => (s.replace(/\s*,\s*/g, ',')),
      default: '' },

    // CONNECTOR_PUBLIC_URI
    { type: 'input',
      name: 'uri',
      message: 'What public URI can your connector be accessed at?',
      validate: validateUri,
      default: (ans) => ('http://localhost:' + ans.port) },

    // CONNECTOR_MAX_HOLD_TIME
    { type: 'input',
      name: 'hold',
      message: 'What is the maximum time you will put funds on hold (in seconds)?',
      validate: validateNumber,
      default: '100' },

    // CONNECTOR_LOG_LEVEL
    { type: 'list',
      name: 'verbosity',
      message: 'What level of verbosity would you like?',
      choices: ['info', 'debug', 'trace', 'fatal', 'error', 'warn'] },

    // number of plugins
    { type: 'input',
      name: 'number',
      message: 'How many ledger connections (plugins) will your connector have?',
      validate: validateNumber,
      default: '2' }
  ])

  const numPlugins = preliminary.number
  const ledgers = {}

  // create each of the plugins
  for (let i = 0; i < numPlugins; ++i) {
    printHeader('Plugin ' + (i + 1) + ' Configuration')
    const pluginType = yield inquirer.prompt([
      { type: 'list',
        message: 'What type is plugin ' + (i + 1) + '?',
        name: 'type',
        choices: Object.keys(pluginQuestions).sort() }
    ])
    const answers = yield inquirer.prompt(pluginQuestions[pluginType.type])
    const ledger = processAnswers[pluginType.type](answers)
    ledgers[ledger.key] = {
      plugin: ledger.plugin,
      currency: ledger.currency,
      options: ledger.options
    }
  }

  // confirm before writing file
  printHeader('Output')
  const confirmation = yield inquirer.prompt([
    { type: 'confirm',
      name: 'confirmed',
      message: 'Write these options to "' + output + '"?',
      default: 'true' }
  ])
  if (!confirmation.confirmed) {
    console.log()
    console.error('aborted by user.')
    process.exit(1)
  }

  // assign all the environment variables
  const env = {}
  env.CONNECTOR_LEDGERS = ledgers
  env.CONNECTOR_PORT = preliminary.port
  env.CONNECTOR_PEERS = preliminary.peers
  env.CONNECTOR_PUBLIC_URI = preliminary.uri
  env.CONNECTOR_MAX_HOLD_TIME = preliminary.hold
  env.CONNECTOR_LOG_LEVEL = preliminary.verbosity

  // write the environment to a docker-compatible env-file
  printInfo('Writing enviroment to "' + output + '"...')
  fs.writeFileSync(
    output,
    Object.keys(env).reduce((out, key) => (
      (env[key])? (out + key + '=' + JSON.stringify(env[key]) + '\n'):(out)
    ), '')
  )
  printInfo('Done.')

}).catch((e) => {
  console.error(e)
  process.exit(1)
})
