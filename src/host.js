const crypto = require('crypto')
const haikunator = new (require('haikunator'))()

module.exports = () => {
  return haikunator.haikunate({ delimiter: '' }) + '.localtunnel.me'
}
