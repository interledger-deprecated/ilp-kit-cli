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
const printTrustlines = require('./trustlines')

const printInfo = (s) => {
  console.info(chalk.gray(s))
}

module.exports = co.wrap(function * (output) {

  if (typeof output !== 'string') {
    console.error('Missing output file. Use \'--help\' for options.')
    process.exit(1)
  } else if (!fs.existsSync(output)) {
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

      printTrustlines(trustlines, ledgers)
    }
    return value
  }, true) // dry-run mode, don't write anything
})
