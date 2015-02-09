var extend = require('extend')

/**
 * Expose transformation for RAML JS Parser 0.8
 */
module.exports = transformRamlJsParser08

/**
 * Transforms a RAML object without mutation.
 *
 * @param  {Object} raml
 * @return {Object}
 */
function transformRamlJsParser08 (data) {
  var obj = {}

  obj.title = String(data.title || '')

  if (data.version) {
    obj.version = String(data.version)
  }

  if (data.baseUri) {
    obj.baseUri = data.baseUri
  }

  if (data.protocols) {
    obj.protocols = data.protocols
  }

  if (data.mediaType) {
    obj.mediaType = data.mediaType
  }

  if (data.baseUriParameters) {
    obj.baseUriParameters = sanitizeParameters(data.baseUriParameters)
  }

  if (data.securitySchemes) {
    obj.securitySchemes = sanitizeSecuritySchemes(data.securitySchemes)
  }

  if (data.securedBy) {
    obj.securedBy = sanitizeSecuredBy(data.securedBy)
  }

  if (data.documentation) {
    obj.documentation = data.documentation
  }

  if (data.traits) {
    obj.traits = sanitizeTraits(data.traits)
  }

  if (data.resourceTypes) {
    obj.resourceTypes = sanitizeResourceTypes(data.resourceTypes)
  }

  if (data.resources) {
    obj.resources = sanitizeResources(data.resources)
  }

  return obj
}

function sanitizeResource (resource) {
  var obj = sanitizeResources(resource.resources || [])

  if (resource.type) {
    obj.type = resource.type
  }

  if (resource.methods) {
    resource.methods.forEach(function (method) {
      obj[method.method] = sanitizeMethod(method)
    })
  }

  return obj
}

function sanitizeResources (resources) {
  var obj = {}

  resources.forEach(function (resource) {
    obj[resource.relativeUri] = sanitizeResource(resource)
  })

  return obj
}

function sanitizeParameters (params) {
  var obj = {}

  Object.keys(params).forEach(function (key) {
    obj[key] = sanitizeParameter(params[key])
  })

  return obj
}

function sanitizeParameter (param) {
  if (Array.isArray(param)) {
    return param.map(sanitizeParameter)
  }

  return pluck(param, [
    'displayName',
    'description',
    'type',
    'enum',
    'pattern',
    'minLength',
    'maxLength',
    'minimum',
    'maximum',
    'example',
    'repeat',
    'required',
    'default'
  ])
}

function sanitizeSecuritySchemes (schemes) {
  var obj = {}

  schemes.forEach(function (schemes) {
    Object.keys(schemes).forEach(function (key) {
      var scheme = schemes[key]

      obj[key] = {
        type: scheme.type,
        description: scheme.description,
        describedBy: sanitizeTrait(scheme.describedBy || {}),
        settings: scheme.settings
      }
    })
  })

  return obj
}

function sanitizeTraits (traits) {
  var obj = {}

  traits.forEach(function (traits) {
    Object.keys(traits).forEach(function (key) {
      obj[key] = sanitizeTrait(traits[key])
    })
  })

  return obj
}

function sanitizeTrait (trait) {
  var obj = {}

  if (trait.headers) {
    obj.headers = sanitizeParameters(trait.headers)
  }

  if (trait.queryParameters) {
    obj.queryParameters = sanitizeParameters(trait.queryParameters)
  }

  if (trait.responses) {
    obj.responses = sanitizeResponses(trait.responses)
  }

  if (trait.body) {
    obj.body = sanitizeBody(trait.body)
  }

  return obj
}

function sanitizeResourceTypes (resourceTypes) {
  var obj = {}

  resourceTypes.forEach(function (resourceTypes) {
    Object.keys(resourceTypes).forEach(function (key) {
      obj[key] = sanitizeResourceType(resourceTypes[key])
    })
  })

  return obj
}

function sanitizeResourceType (resourceType) {
  var obj = {}
  var methodRegExp = /^(head|get|post|put|patch|delete|options|trace|connect)\??$/

  Object.keys(resourceType).forEach(function (key) {
    if (key === 'is') {
      obj[key] = sanitizeIs(resourceType[key])
    } else if (key === 'type') {
      obj[key] = resourceType[key]
    } else if (methodRegExp.test(key)) {
      obj[key] = sanitizeMethod(resourceType[key] || {})
    }
  })

  return obj
}

function sanitizeIs (is) {
  return is.map(String)
}

function sanitizeMethod (method) {
  var obj = sanitizeTrait(method)

  if (method.is) {
    obj.is = sanitizeIs(method.is)
  }

  return obj
}

function sanitizeResponses (responses) {
  var obj = {}

  Object.keys(responses).forEach(function (key) {
    obj[key] = sanitizeResponse(responses[key] || {})
  })

  return obj
}

function sanitizeResponse (response) {
  var obj = {}

  if (response.description) {
    obj.description = response.description
  }

  if (response.headers) {
    obj.headers = sanitizeParameters(response.headers)
  }

  if (response.body) {
    obj.body = sanitizeBody(response.body)
  }

  return obj
}

function sanitizeBody (body) {
  return extend(true, {}, body)
}

function sanitizeSecuredBy (securedBy) {
  var obj = {
    schemes: [],
    settings: {}
  }

  securedBy.forEach(function (scheme) {
    if (typeof scheme === 'object') {
      return Object.keys(scheme).forEach(function (key) {
        obj.schemes.push(key)
        obj.settings[key] = extend(true, {}, scheme[key])
      })
    }

    obj.schemes.push(scheme)
  })

  return obj
}

function pluck (src, keys) {
  var obj = {}

  keys.forEach(function (key) {
    if (src[key] != null) {
      obj[key] = src[key]
    }
  })

  return obj
}
