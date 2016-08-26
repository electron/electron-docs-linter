const path = require('path')
const execSync = require('child_process').execSync
const expect = require('chai').expect
const rimraf = require('rimraf').sync
const keyedArray = require('keyed-array')

// remove any existing file
rimraf(path.join(__dirname, 'electron.json'))

// produce a new one
execSync(path.join(__dirname, '../cli.js vendor/electron --version=1.2.3 --outfile=test/electron.json'))

// require it
const apis = keyedArray(require('./electron.json'))

describe('CLI', function () {
  this.timeout(10 * 1000)

  it('produces a JSON file', function () {
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
