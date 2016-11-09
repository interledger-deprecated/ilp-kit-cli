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
      default: env.API_DB_URI || 'postgres://localhost/ilpkit' },

    // LEDGER_ADMIN_USER
    { type: 'input',
      name: 'admin_user',
      message: 'What is the username of your ledger\'s admin account?',
      default: env.LEDGER_ADMIN_USER || 'admin' },

    // LEDGER_ADMIN_PASS
    { type: 'input',
      name: 'admin_pass',
      message: 'What is the password to your ledger\'s admin account?',
      default: env.LEDGER_ADMIN_PASS || crypto.randomBytes(15).toString('base64') },

    // API_CLIENT_HOST, API_HOSTNAME
    { type: 'input',
      name: 'hostname',
      message: 'What hostname will this ilp-kit be running on?',
      default: env.API_HOSTNAME || 'ilpkit.example.com' },

    // API_SECRET
    { type: 'input',
      name: 'secret',
      message: 'What secret key will your ilp-kit use?',
      default: env.API_SECRET || crypto.randomBytes(33).toString('base64') },

    // LEDGER_CURRENCY_CODE
    { type: 'input',
      name: 'ledger_currency_code',
      message: 'What is your ledger\'s currency code?',
      validate: valid.validateCurrency,
      default: env.LEDGER_CURRENCY_CODE || 'USD' },

    // LEDGER_CURRENCY_SYMBOL
    { type: 'input',
      name: 'ledger_currency_symbol',
      message: 'What is your ledger\'s currency symbol?',
      default: env.LEDGER_CURRENCY_SYMBOL || '$' },

    // LEDGER_ILP_PREFIX
    { type: 'input',
      name: 'ledger_ilp_prefix',
      message: 'What is your ledger\'s ILP prefix?',
      validate: valid.validatePrefix,
      default: env.LEDGER_ILP_PREFIX || 'test.' + crypto.randomBytes(2).toString('hex') + '.' },

    // ledger recommended connectors?

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
      default: env.API_MAILGUN_API_KEY || 'example.com',
      when: (answers) => answers.mailgun },

    { type: 'confirm',
      name: 'connector',
      message: chalk.grey(
        'In order to send payments between your ILP Kit and others\', you\'ll need\n',
        ' to run a connector. A connector has credentials on several different ledgers\n',
        ' and it trades between them. You can always come back and run a connector\n',
        ' later, or run it separately from your ILP Kit.\n\n'
      ) + '  Would you like to configure a connector?',
      default: !!env.CONNECTOR_ENABLE }
  ])
}

module.exports = askWalletQuestions
