#!/usr/bin/env node
'use strict'

const path = require('path')
const fs = require('fs')
const commander = require('commander')
const inquirer = require('inquirer')

const crypto = require('crypto')
const keypairs = require('ripple-keypairs')

const validateNumber = (s) => !!s.match(/^[0-9]+$/)
const validateNegativeNumber = (s) => !!s.match(/^\-?[0-9]+$/)
const validatePrefix = (s) => !!s.match(/^[a-zA-Z0-9._~-]+\.$/)
const validateAccount = (s) => !!s.match(/^[a-zA-Z0-9_~-]+$/)
const validateRippleSecret = (s) => !!s.match(/^s[rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz]+$/)

const questions = {
  'virtual': [
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

  'bells': [
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
  virtual: (answers) => {
    let result = {
      type: 'virtual',
      asset: answers.currencyCode,
      id: answers.prefix,
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

    if (answers.settleRipple) {
      result._optimisticPlugin = 'ilp-plugin-ripple'
      result._optimisticPluginOpts = {
        type: 'ripple',
        address: keypairs.deriveAddress(keypairs.deriveKeypair(secret).publicKey),
        secret: answers.settleSecret,
        server: answers.settleServer
      }
    }

    return result
  },
  bells: (answers) => {
    return {
      type: 'bells',
      asset: answers.currencyCode,
      id: answers.ledger,
      username: answers.username,
      password: answers.password,
      account: answers.account,
      ledger: answers.ledger
    }
  }
}

commander
  .version('2.0.0')
  .option('-t, --type <type>', 'type of ledger plugin (as in ilp-plugin-<type>)')
  .option('-o, --output <output>', 'file to output to (eg. example.json)')
  .parse(process.argv)

const type = commander.type
if (typeof type !== 'string' || Object.keys(questions).indexOf(type) < 0) {
  commander.outputHelp()
  console.error('Invalid plugin type. Enter either "-t virtual" or "-t bells"')
  process.exit(1)
}

const output = commander.output
if (typeof output !== 'string') {
  commander.outputHelp()
  console.error('Missing output file. Specify a json file to output to with "-o" or "--output"')
  process.exit(1)
} else if (fs.existsSync(output)) {
  console.error('Will overwrite "' + output + '". Cancel now if you aren\'t ok with that.') 
}

console.log()
inquirer.prompt(questions[type]).then((answers) => {
  const result = processAnswers[type](answers)
  console.log('\nWriting data to "' + output + '"...')
  fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n')
  console.log('Done!')
}).catch((e) => {
  console.error(e)
  process.exit(1)
})
