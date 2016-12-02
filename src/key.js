'use strict'

const fs = require('fs')
const sodium = require('chloride')
const co = require('co')
const inquirer = require('inquirer')
const crypto = require('crypto')
const base64url = require('base64url')
const chalk = require('chalk')

const getSecret = require('./secret')

module.exports = co.wrap(function * (input) {
  if (typeof input !== 'string') {
    console.error('Missing input file. Use \'--help\' for options.')
    process.exit(1)
  } else if (!fs.existsSync(input)) {
    console.error('"' + input + '" does not yet exist. Run \'configure\' to create it.')
    process.exit(1)
  }

  const secret = yield getSecret(input)

  console.log('Your public key is:')
  console.log('\n ', chalk.yellow(base64url(sodium.crypto_scalarmult_base(
    sodium.crypto_hash_sha256(base64url.toBuffer(secret))
  ))))
  console.log()
  console.log('Share it with the world!')
})
