'use strict'

const CollectionItem = require('./collection-item')
const pattern = /<code>..*?\.((?:\w+\.?)+)(.*)<\/code>/
const props = ['name', 'signature', 'platforms', 'description', 'parameters', 'returns', '_superObject']

module.exports = class Method extends CollectionItem {
  constructor (api, el) {
    super(api, el, pattern, props)

    if (this.match) {
      this.name = this.match[1]
      this.signature = this.match[2]
      this.platforms = this.getPlatforms()
      this.description = this.getDescription()
      this.parameters = this.getParameters()
      this.returns = this.getReturns()

      const subProp = this.name.split('.')
      if (subProp.length === 2) {
        this.name = subProp[1]
        this._superObject = subProp[0]
      } else if (subProp.length > 2) {
        console.error('Problem parsing deep subproperty')
        console.error(`pattern: ${pattern}`)
        console.error(`el: ${el}`)
      }
      // derive an array of parameter names from the method signature;
      // used only in tests to verify that all parameters are documented
      //
      // "()" becomes []
      // "(code[, userGesture])" becomes ['code', 'userGesture']
      // (channel[, arg1][, arg2][, ...]) becomes ['channel']
      if (this.signature === '()') {
        this.signatureParameters = []
      } else {
        this.signatureParameters = this.signature
          .replace(/\[.*\.\.\.]/, '')
          .replace(/\W/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .split(' ')
      }
    }

    return this
  }
}
