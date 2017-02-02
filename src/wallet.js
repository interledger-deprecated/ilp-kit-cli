const inquirer = require('inquirer')
const crypto = require('crypto')
const valid = require('./validate')
const chalk = require('chalk')
const password = require('./password')
const base64url = require('base64url')
const randomHost = require('./host')

const askWalletQuestions = function * (env) {
  return yield inquirer.prompt([
    // DB_URI
    { type: 'input',
      name: 'db_uri',
      message: 'What is the address of your ILP Kit\'s DB?',
      default: env.DB_URI || 'sqlite://ilp-kit.db' },

    // domain
    { type: 'input',
      name: 'hostname',
      message: 'What is the hostname that you\'ll be running on?',
      validate: valid.validatePeers,
      default: env.CLIENT_HOST || randomHost() },

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
      default: (env.LEDGER_ILP_PREFIX || '').split('.')[0].toUpperCase() || 'US' },

    { type: 'confirm',
      name: 'github',
      message: chalk.grey(
'A GitHub account can be linked to your ILP Kit, which allows users to\n',
' create accounts linked to their GitHub accounts. In order to configure\n',
' this functionality, you\'ll need to get your Github client ID and your\n',
' GitHub client secret.\n\n'
      ) + '  Would you like to configure login through github?',
      default: !!env.API_GITHUB_CLIENT_ID || false },

    { type: 'input',
      name: 'github_id',
      message: 'What is your github client ID?',
      default: env.API_GITHUB_CLIENT_ID || '',
      when: (answers) => answers.github},

    { type: 'input',
      name: 'github_secret',
      message: 'What is your github client secret?',
      default: env.API_GITHUB_CLIENT_SECRET || '',
      when: (answers) => answers.github},

    { type: 'confirm',
      name: 'mailgun',
      message: chalk.grey(
        'Mailgun can be used to send verification emails when users create\n',
        ' new accounts. In order to use mailgun, you must create an account\n',
        ' on their site, http://www.mailgun.com/, get an API key, and associate\n',
        ' a web hosting domain.\n\n'
      ) + '  Would you like to configure mailgun?',
      default: !!env.API_MAILGUN_API_KEY || false },

    { type: 'input',
      name: 'mailgun_api_key',
      message: 'What is your mailgun API key?',
      default: env.API_MAILGUN_API_KEY || '',
      when: (answers) => answers.mailgun},

    { type: 'input',
      name: 'mailgun_domain',
      message: 'What is your mailgun domain?',
      default: env.API_MAILGUN_DOMAIN || 'example.com',
      when: (answers) => answers.mailgun }
  ])
}

module.exports = askWalletQuestions
