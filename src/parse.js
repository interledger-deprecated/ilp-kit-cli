const fs = require('fs')

module.exports = (file) => {
  const env = {}

  // TODO: variables _can_ be multiline or use shell interpolation
  for (let line of fs.readFileSync(file, 'utf-8').split('\n')) {
    const match = line.match(/^export (.+?)=["']?(.+?)["']?$/)

    if (!match) continue
    env[match[1]] = match[2]
  }

  return env
}
