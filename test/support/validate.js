var schema = require('../../schema.json')
var Ajv = require('ajv')
var ajv = Ajv({ allErrors: true, verbose: true })
var validate = ajv.compile(schema)

module.exports = validateObject

function validateObject (obj) {
  var result = validate(obj)

  return {
    valid: result,
    errors: validate.errors
  }
}
