const fs = require('fs')
const chalk = require('chalk')

const printInfo = (s) => {
  console.info(chalk.gray(s))
}

module.exports = function * (file, callback) {
  const env = {}

  // TODO: variables _can_ be multiline or use shell interpolation
  for (let line of fs.readFileSync(file, 'utf-8').split('\n')) {
    const match = line.match(/^(.+?)=(.+?)$/)
    if (!match) continue

    try {
      const value = yield callback(match[1], match[2])
      env[match[1]] = value
    } catch (e) {
      console.log(e)
      env[match[1]] = match[2]
    }
  }

  printInfo('Writing enviroment to "' + file + '"...')
  fs.writeFileSync(
    file,
    Object.keys(env).reduce((out, key) => (
      (out + key + '=' + env[key] + '\n')
    ), '')
  )
  printInfo('Done.')
}
