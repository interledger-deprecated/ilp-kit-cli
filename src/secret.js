const parse = require('./parse')
const co = require('co')

module.exports = co.wrap(function * (file) {
  let secret
  yield parse(file, function * (variable, value) {
    if (variable === 'API_SECRET') {
      secret = value
    }
  }, true) // don't modify the file

  if (!secret) {
    console.error('API_SECRET not specified in "' + file + '". Modify it or run \'configure\'')
    process.exit(1)
  }

  return secret
})
