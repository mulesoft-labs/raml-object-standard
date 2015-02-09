/* global describe, it */
var expect = require('chai').expect
var tv4 = require('tv4')
var schema = require('../schema.json')

describe('json schema', function () {
  it('should accept a valid object', function () {
    var result = tv4.validateMultiple({
      title: 'Example',
      resources: {
        '/users': {
          '/{userId}': {
            post: {
              description: 'Create a new user'
            }
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
    }, schema)

    expect(result.valid).to.be.true
  })
})
