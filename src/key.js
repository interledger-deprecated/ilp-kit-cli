'use strict'

const sodium = require('chloride')
const co = require('co')
const inquirer = require('inquirer')
const crypto = require('crypto')
const base64url = require('base64url')
const chalk = require('chalk')

module.exports = co.wrap(function * () {
  const answers = yield inquirer.prompt([
    { type: 'input',
      name: 'secret',
      message: 'What is your (base64url encoded) secret?',
      default: base64url(crypto.randomBytes(32)) }
  ])

  console.log('Your public key is:')
  console.log('\n ', chalk.yellow(base64url(sodium.crypto_scalarmult_base(
    sodium.crypto_hash_sha256(base64url.toBuffer(answers.secret))
  ))))
  console.log()
  console.log('Share it with the world!')
})
