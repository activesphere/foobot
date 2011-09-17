sys = require('sys')
fs = require('fs')

Settings = exports = module.exports = (file) ->
  JSON.parse fs.readFileSync(file)