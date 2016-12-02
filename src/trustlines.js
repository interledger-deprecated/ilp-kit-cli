const chalk = require('chalk')

module.exports = (trustlines, ledgers, secret) => {
  let danger = false

  console.log()
  for (t of trustlines) {
    const name = ledgers[t].options.name

    const differentSecret = secret && ledgers[t].options.secret !== secret
    danger = danger || differentSecret

    console.log(
      (differentSecret ? chalk.red('* '):'') +
      (name? (chalk.yellow(name) + ' (' + t + ')'):chalk.yellow(t)) +
      ', public key ' +
      ledgers[t].options.peerPublicKey + ', for a maximum of ' +
      ledgers[t].options.maxBalance + ' ' + ledgers[t].currency)
  }
  console.log()

  if (danger) {
    console.log(chalk.red('* indicates that a trustline does not use your configured secret'))
  }
}
