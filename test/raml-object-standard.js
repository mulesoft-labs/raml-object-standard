/* global describe, it */
var expect = require('chai').expect
var RamlObject = require('..')

describe('raml object', function () {
  var instance = new RamlObject({
    title: 'Example API',
    version: '1.0',
    baseUri: 'http://{version}.example.com',
    documentation: [{
      title: 'Hello World',
      content: 'This is my API'
    }],
    protocols: ['HTTP'],
    securitySchemes: {
      'oauth_2_0': {
        type: 'OAuth 2.0',
        describedBy: {
          headers: {
            Authorization: null
          }
        }
      }
    },
    securedBy: ['oauth_2_0'],
    resourceTypes: {
      collection: {
        get: {
          is: ['paged']
        }
      }
    },
    traits: {
      paged: {
        queryParameters: {
          limit: {
            type: 'number',
            minimum: 1,
            maximum: 50,
            default: 20
          },
          offset: {
            type: 'number'
          }
        }
      }
    },
    resources: {
      '/users': {
        type: 'collection',
        '/{userId}': {
          get: null
        }
      }
    }
  })

  it('should create a new instance', function () {
    expect(instance).to.be.an.instanceOf(RamlObject)
  })

  describe('basic properties', function () {
    it('should get title', function () {
      expect(instance.getTitle()).to.be.a('string')
    })

    it('should get version', function () {
      expect(instance.getVersion()).to.be.a('string')
    })

    it('should get base uri', function () {
      expect(instance.getBaseUri()).to.be.a('string')
    })

    it('should get base uri parameters', function () {
      var params = instance.getBaseUriParameters()

      expect(params).to.be.an('object')
      expect(params.version).to.deep.equal({ type: 'string', default: '1.0' })
    })

    it('should get media type', function () {
      expect(instance.getMediaType()).to.be.undefined
    })

    it('should get secured by', function () {
      expect(instance.getSecuredBy()).to.be.an('object')
    })

    it('should get documentation', function () {
      expect(instance.getDocumentation()).to.be.an('array')
    })

    it('should get resource types', function () {
      expect(instance.getTypes()).to.deep.equal(['collection'])
    })

    it('should get a single resource type', function () {
      expect(instance.getType('collection')).to.be.an('object')
    })

    it('should get traits', function () {
      expect(instance.getTraits()).to.deep.equal(['paged'])
    })

    it('should get a single trait', function () {
      expect(instance.getTrait('paged')).to.be.an('object')
    })

    it('should get security schemes', function () {
      expect(instance.getSecuritySchemes()).to.deep.equal(['oauth_2_0'])
    })

    it('should get a security scheme', function () {
      expect(instance.getSecurityScheme('oauth_2_0')).to.be.an('object')
    })

    it('should get all resource paths', function () {
      expect(instance.getResources()).to.deep.equal([
        '/',
        '/users',
        '/users/{userId}'
      ])
    })

    it.skip('should get a resources methods', function () {
      expect(instance.getResourceMethods('/users')).to.deep.equal(['get'])
    })

    it('should get resource uri parameters', function () {
      expect(instance.getResourceParameters('/users/{userId}')).to.an('object')
    })
  })
})
