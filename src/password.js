const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const base62 = require('base-x')(BASE62)
const crypto = require('crypto')

module.exports = () => {
  return base62.encode(crypto.randomBytes(18))
}
