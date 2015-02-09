/* global describe, it */
var expect = require('chai').expect
var tv4 = require('tv4')
var parser = require('raml-parser')
var join = require('path').join
var schema = require('../../schema.json')
var transform = require('../../transform/raml-js-parser-08')

describe('raml js parser 0.8', function () {
  it('should parse and transform raml into standard object', function () {
    this.timeout(60 * 1000)

    return parser.loadFile(join(__dirname, '../fixtures/github_v3/api.raml'))
      .then(function (data) {
        var raml = transform(data)
        var result = tv4.validateResult(raml, schema)

        expect(result.errors).to.be.empty
        expect(result.missing).to.be.empty

        expect(raml.title).to.be.a('string')
        expect(raml.version).to.be.a('string')
        expect(raml.baseUri).to.be.a('string')
        expect(raml.protocols).to.deep.equal(['HTTPS'])
        expect(raml.mediaType).to.equal('application/json')
        expect(raml.securitySchemes).to.be.an('object')
        expect(raml.securedBy).to.be.an('object')
        expect(raml.traits).to.be.an('object')
        expect(raml.resourceTypes).to.be.an('object')
        expect(raml.resources).to.be.an('object')
      })
  })
})
