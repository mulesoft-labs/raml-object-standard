/* global describe, it */
var expect = require('chai').expect
var validate = require('./support/validate')

describe('json schema', function () {
  describe('resources', function () {
    it('should validate sub-resources', function () {
      var result = validate({
        title: 'Example',
        resources: {
          '/users': {
            '/{userId}': {
              post: {
                description: 'Create a new user'
              }
            },
            get: {
              description: 'Get all the users',
              queryParameters: {
                sort: {
                  type: 'string',
                  enum: ['asc', 'desc']
                }
              },
              responses: {
                '200': {
                  body: {
                    'application/json': {}
                  }
                }
              }
            }
          }
        }
      })

      expect(result.valid).to.be.true
    })

    it('should invalidate unknown resource properties', function () {
      var result = validate({
        title: 'Example',
        resources: {
          '/users': {
            'unknown': {}
          }
        }
      })

      expect(result.valid).to.be.false
    })
  })

  describe('named parameters', function () {
    it('should validate named parameters', function () {
      var result = validate({
        title: 'Example',
        baseUri: 'http://example.com',
        resources: {
          '/{id}': {
            uriParameters: {
              id: {
                type: 'number',
                minimum: 50,
                maximum: 100
              }
            }
          }
        }
      })

      expect(result.valid).to.be.true
    })

    it('should be invalid with unknown named parameter type', function () {
      var result = validate({
        title: 'Example',
        baseUri: 'http://example.com/{zone}',
        baseUriParameters: {
          zone: {
            type: 'unknown'
          }
        }
      })

      expect(result.valid).to.be.false
    })

    it('should be invalid with unknown named parameter property', function () {
      var result = validate({
        title: 'Example',
        baseUri: 'http://example.com/{zone}',
        baseUriParameters: {
          zone: {
            type: 'string',
            unknown: true
          }
        }
      })

      expect(result.valid).to.be.false
    })
  })

  describe('responses', function () {
    it('should accept null response bodies', function () {
      var result = validate({
        title: 'Example',
        resources: {
          '/': {
            get: {
              responses: {
                '200': {
                  body: {
                    'application/json': null
                  }
                }
              }
            }
          }
        }
      })

      expect(result.valid).to.be.true
    })

    it('should accept a body using the root a media type', function () {
      var result = validate({
        title: 'Example',
        mediaType: 'application/json',
        resources: {
          '/': {
            get: {
              responses: {
                '200': {
                  body: {
                    schema: '...'
                  }
                }
              }
            }
          }
        }
      })

      expect(result.valid).to.be.true
    })

    it('should invalidate invalid media types', function () {
      var result = validate({
        title: 'Example',
        resources: {
          '/': {
            get: {
              responses: {
                '200': {
                  unknown: null
                }
              }
            }
          }
        }
      })

      expect(result.valid).to.be.false
    })

    it('should invalidate non-numeric response codes', function () {
      var result = validate({
        title: 'Example',
        resources: {
          '/': {
            get: {
              responses: {
                'test': {
                  'application/json': null
                }
              }
            }
          }
        }
      })

      expect(result.valid).to.be.false
    })
  })
})
