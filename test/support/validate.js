var schema = require('../../schema.json')
var ZSchema = require('z-schema')
var join = require('path').join
var readFile = require('fs').readFileSync
var validator = new ZSchema()

validator.setRemoteReference(
  'http://json-schema.org/draft-04/schema',
  JSON.parse(readFile(join(__dirname, '../../vendor/schema'), 'utf8'))
)

module.exports = validateObject

function validateObject (obj) {
  var result = validator.validate(obj, schema)

  return {
    valid: result,
    errors: validator.getLastErrors()
  }
}
