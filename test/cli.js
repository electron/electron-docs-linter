const path = require('path')
const exec = require('child_process').exec
const expect = require('chai').expect
const rimraf = require('rimraf').sync
const keyedArray = require('keyed-array')

describe('CLI', function () {
  this.timeout(10 * 1000)

  it('produces a JSON file', function () {
    rimraf(path.join(__dirname, 'electron.json'))
    exec('node ' + path.join(__dirname, '../cli.js test/fixtures/electron/docs/api --version=1.2.3 --outfile=test/electron.json'), function (err, stdout, stderr) {
      expect(err).to.eq(null)
      const apis = keyedArray(require('./electron.json'))

      expect(apis).to.be.an('array')
      expect(apis.length).to.be.above(10)

      // check for instanceName property on all classes
      var classes = apis.filter(api => api.type === 'Class')
      expect(classes.length).to.be.above(10)
      expect(classes.every(api => api.instanceName.length > 0)).to.equal(true)

      // clean up
      rimraf(path.join(__dirname, 'electron.json'))
    })
  })

  it('prints errors to STDERR', function (done) {
    exec('node ' + path.join(__dirname, '../cli.js test/fixtures/malformed'), function (err, stdout, stderr) {
      expect(err).to.exist
      expect(stderr).to.include('expected 3 instanceMethods but only found 2')
      expect(stderr).to.include('expected 4 instanceProperties but only found 3')
      expect(stderr).to.include('description must not be empty')
      done()
    })
  })
})
