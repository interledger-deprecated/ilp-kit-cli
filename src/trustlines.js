const chalk = require('chalk')

module.exports = (trustlines, ledgers) => {
  console.log()
  for (t of trustlines) {
    const name = ledgers[t].options.name

    console.log((name? (chalk.yellow(name) + ' (' + t + ')'):chalk.yellow(t)) +
      ', public key ' +
      ledgers[t].options.peerPublicKey + ', for a maximum of ' +
      ledgers[t].options.maxBalance + ' ' + ledgers[t].currency)
  }
  console.log()
}
