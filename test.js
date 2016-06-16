const test = require('tape')
const superagent = require('superagent')
const apis = require('.')

test('apis', function (t) {

  t.plan(1 + apis.length * 2)

  t.ok(apis.length >= 26, 'has at least 26 apis')

  apis.forEach(api => {
    t.comment(api.name)
    t.ok(api.website_url, 'has a website_url')
    superagent
      .head(api.github_docs_url)
      .end(function (err, res) {
        t.equal(200, res.status, `has a github_docs_url that actually exists: ${api.name}`)
      })
  })
})
