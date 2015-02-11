/* global describe, it */
var expect = require('chai').expect
var validate = require('./support/validate')
var parser = require('raml-parser')
var join = require('path').join
var transform = require('../transform/raml-js-parser-08')

describe('transform raml js parser 0.8', function () {
  it('should parse and transform raml into standard object', function () {
    this.timeout(5 * 60 * 1000)

    return parser.loadFile(join(__dirname, 'fixtures/github_v3/api.raml'))
      .then(function (data) {
        var raml = transform(data)
        var result = validate(raml)

        expect(result.valid).to.be.true
        expect(result.errors).to.be.empty

        expect(raml.title).to.be.a('string')
        expect(raml.version).to.be.a('string')
        expect(raml.baseUri).to.be.a('string')
        expect(raml.protocols).to.deep.equal(['HTTPS'])
        expect(raml.mediaType).to.equal('application/json')
        expect(raml.securitySchemes).to.be.an('object')
        expect(raml.securedBy).to.be.an('array')
        expect(raml.traits).to.be.an('object')
        expect(raml.resourceTypes).to.be.an('object')
        expect(raml.resources).to.be.an('object')
      })
  })
})
