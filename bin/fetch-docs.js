const electronDocs = require('electron-docs')
const fs = require('fs')
const path = require('path')
const rm = require('rimraf').sync
const mkdirp = require('mkdirp').sync
const fixturePath = path.join(__dirname, '../test/fixtures/electron/docs/api/')
var version = process.argv[2]

console.log('removing any existing fixtures')
rm(fixturePath)

if (!version) {
  version = 'master'
  console.log('defaulting to master branch')
} else {
  console.log(`fetching docs from ${version}`)
}

electronDocs(version).then(docs => {
  docs.forEach(doc => {
    const filename = path.join(fixturePath, doc.filename)
    console.log(path.relative(__dirname, filename))
    mkdirp(path.dirname(filename))
    fs.writeFileSync(filename, doc.markdown_content)
  })
})
