const inquirer = require('inquirer')
const crypto = require('crypto')
const valid = require('./validate')

const askWalletQuestions = function * () {
  return yield inquirer.prompt([
    // API_DB_URI
    { type: 'input',
      name: 'db_uri',
      message: 'What is the address of your postgres DB?',
      default: 'postgres://localhost/wallet' },

    // API_LEDGER_ADMIN_NAME
    { type: 'input',
      name: 'admin_name',
      message: 'What is the username of your ledger\'s admin account?',
      default: 'admin' },

    // API_LEDGER_ADMIN_PASS
    { type: 'input',
      name: 'admin_pass',
      message: 'What is the password to your ledger\'s admin account?',
      default: crypto.randomBytes(15).toString('base64') },

    // API_CLIENT_HOST, API_HOSTNAME
    { type: 'input',
      name: 'hostname',
      message: 'What hostname will this wallet be running on?',
      default: 'wallet.example.com' },

    // API_CLIENT_PORT, API_PUBLIC_PORT
    { type: 'input',
      name: 'public_port',
      message: 'What port will you be running on?',
      validate: valid.validateNumber,
      default: '443' },

    // API_SECRET
    { type: 'input',
      name: 'secret',
      message: 'What secret key will your API use?',
      default: crypto.randomBytes(33).toString('base64') },

    // LEDGER_ILP_PREFIX
    { type: 'input',
      name: 'ledger_ilp_prefix',
      message: 'What is your ledger\'s ILP prefix?',
      validate: valid.validatePrefix,
      default: 'test.' + crypto.randomBytes(3).toString('base64') + '.' },

    // ledger recommended connectors?

    // LEDGER_ED25519_SECRET_KEY
    { type: 'input',
      name: 'ledger_ed25519',
      message: 'What ed25519 secret key will your ledger use?',
      default: crypto.randomBytes(33).toString('base64') },

    // API_ED25519_SECRET_KEY
    { type: 'input',
      name: 'api_ed25519',
      message: 'What ed25519 secret key will your API use?',
      default: crypto.randomBytes(33).toString('base64') },

    { type: 'confirm',
      name: 'github',
      message: 'Would you like to configure login through github?',
      default: false },

    { type: 'input',
      name: 'github_id',
      message: 'What is your github client ID?',
      when: (answers) => answers.github},

    { type: 'input',
      name: 'github_secret',
      message: 'What is your github client secret?',
      when: (answers) => answers.github},

    { type: 'confirm',
      name: 'mailgun',
      message: 'Would you like to configure mailgun?',
      default: false },

    { type: 'input',
      name: 'mailgun_api_key',
      message: 'What is your mailgun API key?',
      when: (answers) => answers.mailgun},

    { type: 'input',
      name: 'mailgun_domain',
      message: 'What is your mailgun domain?',
      default: 'example.com',
      when: (answers) => answers.mailgun}
  ])
}

module.exports = askWalletQuestions
