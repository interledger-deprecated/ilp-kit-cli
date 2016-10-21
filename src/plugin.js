const inquirer = require('inquirer')
const chalk = require('chalk')
const PluginBells = require('ilp-plugin-bells')

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
    default: 'testtest' }
]

const askPluginQuestions = function * () {
  let answers

  try {
    answers = yield inquirer.prompt(pluginQuestions)
  } catch (e) {
    console.error(chalk.red('Invalid account URI or password:' + e.message))
    return (yield askPluginQuestions())
  }

  const username = (/^.*\/(.+)$/).exec(answers.account)[1]
  const plugin = new PluginBells({
    username: username,
    password: answers.password,
    account: answers.account
  })

  yield plugin.connect()
  const info = yield plugin.getInfo()
  const ledger = yield plugin.getPrefix()
  yield plugin.disconnect()

  return {
    key: ledger,
    plugin: 'ilp-plugin-bells',
    currency: info.currencyCode,
    options: {
      username: username,
      password: answers.password,
      account: answers.account,
      ledger: ledger
    }
  }
}

module.exports = askPluginQuestions
