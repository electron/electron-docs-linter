const seeds = require('./lib/seeds.json')
const API = require('./lib/api')
const fetchDocs = require('electron-docs')
const pify = require('pify')

function lint (path, callback) {
  return fetchDocs(path)
    .then(function (docs) {
      var apis = seeds.map(props => new API(props, docs))
      return callback(null, apis)
    })
    .catch(function (err) {
      return callback(err)
    })
}

module.exports = pify(lint)
