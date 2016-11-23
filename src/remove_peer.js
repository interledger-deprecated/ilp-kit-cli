const inquirer = require('inquirer')
const crypto = require('crypto')
const valid = require('./validate')
const chalk = require('chalk')
const sodium = require('chloride')
const co = require('co')
const base64url = require('base64url')
const currencies = require('./currency')
const path = require('path')
const fs = require('fs')
const parse = require('./parse')

const printInfo = (s) => {
  console.info(chalk.gray(s))
}

module.exports = co.wrap(function * (output) {

  if (typeof output !== 'string') {
    commander.outputHelp()
    console.error('Missing output file. Specify an env file to output to with "-o" or "--output"')
    process.exit(1)
  } else if (fs.existsSync(output)) {
    printInfo('Will modify "' + output + '". Cancel now if you aren\'t ok with that.')
  } else {
    console.error('"' + output + '" does not yet exist. Run \'configure\' to create it.')
    process.exit(1)
  }
  
  yield parse(output, function * (variable, value) {
    if (variable === 'CONNECTOR_LEDGERS') {
      const ledgers = JSON.parse(value)
      const trustlines = Object.keys(ledgers).filter((ledger) => {
        return ledgers[ledger].plugin === 'ilp-plugin-virtual'
      })

      if (!trustlines.length) {
        console.error('No trustlines have been configured yet.')
        process.exit(1)
      }

      console.log()
      for (t of trustlines) {
        console.log(chalk.yellow(t) + ' is with ' +
          ledgers[t].options.peerPublicKey + ', for a maximum of ' +
          ledgers[t].options.maxBalance + ' ' + ledgers[t].currency)
      }
      console.log()

      const answers = yield inquirer.prompt([
        { type: 'list',
          message: 'Which connection would you like to remove?',
          name: 'deleted',
          choices: trustlines }
      ])

      delete ledgers[answers.deleted]
      return JSON.stringify(ledgers)
    }
    return value
  })
})
