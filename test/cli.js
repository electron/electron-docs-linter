const path = require('path')
const execSync = require('child_process').execSync
const expect = require('chai').expect
const rimraf = require('rimraf').sync

// remove any existing file
rimraf(path.join(__dirname, 'electron.json'))

// produce a new one
execSync(path.join(__dirname, '../cli.js vendor/electron --version=1.2.3 --outfile=test/electron.json'))

// require it
const apis = require('./electron.json')

describe('CLI', function () {
  this.timeout(10 * 1000)

  it('produces a JSON file', function () {
    expect(apis).to.be.an('array')
    rimraf(path.join(__dirname, 'electron.json'))
  })
})
