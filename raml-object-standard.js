var extend = require('extend')

module.exports = RamlObject

var DEFAULT_OPTIONS = {
  format: identity,
  splitUri: /(?=\/)/
}

var TEMPLATE_REGEXP = /\{[^\{\}]+\}/g

function RamlObject (raml, options) {
  var opts = extend({}, DEFAULT_OPTIONS, options)

  this._title = raml.title
  this._version = raml.version
  this._baseUri = raml.baseUri
  this._mediaType = raml.mediaType
  this._protocols = raml.protocols
  this._securitySchemes = raml.securitySchemes || {}
  this._securedBy = sanitizeSecuredBy(raml.securedBy, this._securitySchemes)
  this._documentation = raml.documentation
  this._resourceTypes = raml.resourceTypes || {}
  this._traits = raml.traits || {}
  this._resources = createResourceMap(raml, opts)
  this._baseUriParameters = createBaseUriParameters(raml)
}

[
  'title',
  'version',
  'baseUri',
  'mediaType',
  'protocols',
  'securedBy',
  'documentation',
  'baseUriParameters'
].forEach(function (prop) {
  var method = 'get' + prop.charAt(0).toUpperCase() + prop.substr(1)

  RamlObject.prototype[method] = function () {
    return this['_' + prop]
  }
})

RamlObject.prototype.getTypes = function () {
  return Object.keys(this._resourceTypes)
}

RamlObject.prototype.getType = function (name) {
  return this._resourceTypes[name]
}

RamlObject.prototype.getTraits = function () {
  return Object.keys(this._traits)
}

RamlObject.prototype.getTrait = function (name) {
  return this._traits[name]
}

RamlObject.prototype.getSecuritySchemes = function () {
  return Object.keys(this._securitySchemes)
}

RamlObject.prototype.getSecurityScheme = function (name) {
  return this._securitySchemes[name]
}

RamlObject.prototype.getResources = function () {
  return Object.keys(this._resources)
}

RamlObject.prototype.getResourceMethods = function (path) {
  var resource = this._resources[path]

  return resource && Object.keys(resource.methods)
}

RamlObject.prototype.getResourceParameters = function (path) {
  var resource = this._resources[path]

  return resource && resource.absoluteUriParameters
}

RamlObject.prototype.getMethodHeaders = function (path, verb) {
  var resource = this._resources[path]
  var method = resource && resource.methods[verb]

  return method && method.headers
}

RamlObject.prototype.getMethodQuery = function (path, verb) {
  var resource = this._resources[path]
  var method = resource && resource.methods[verb]

  return method && method.query
}

RamlObject.prototype.getMethodBody = function (path, verb) {
  var resource = this._resources[path]
  var method = resource && resource.methods[verb]

  return method && method.body
}

RamlObject.prototype.getMethodResponseCodes = function (path, verb) {
  var resource = this._resources[path]
  var method = resource && resource.methods[verb]

  return method && method.responses && Object.keys(method.responses)
}

RamlObject.prototype.getMethodResponse = function (path, verb, code) {
  var resource = this._resources[path]
  var method = resource && resource.methods[verb]

  return method && method.responses && method.responses[code]
}

function identity (x) {
  return x
}

function parameters (path, src) {
  var dest = {}
  var params = array(path.match(TEMPLATE_REGEXP)).map(getParamName)

  if (src) {
    params.forEach(function (key) {
      if (src[key] != null) {
        dest[key] = src[key]
      } else {
        dest[key] = { type: 'string' }
      }
    })
  } else {
    params.forEach(function (key) {
      dest[key] = { type: 'string' }
    })
  }

  return dest
}

function getParamName (param) {
  return param.slice(1, -1)
}

function array (value) {
  var arr = []

  if (value != null) {
    for (var i = 0; i < value.length; i++) {
      arr.push(value[i])
    }
  }

  return arr
}

function createResourceMap (raml, options) {
  var map = {}

  var root = map['/'] = {
    methods: {},
    children: {},
    relativeUri: '',
    absoluteUri: '',
    relativeUriParameters: {},
    absoluteUriParameters: {}
  }

  function recursiveExtractPaths (obj, parts, resource) {
    var part = parts[0]
    var params = resource.uriParameters

    if (/\{mediaTypeExtension\}$/.test(part)) {
      if (Array.isArray(params.mediaTypeExtension.enum)) {
        params.mediaTypeExtension.enum.forEach(function (mediaTypeExtension) {
          var extension = '.' + mediaTypeExtension.replace(/^\./, '')
          var pathName = part.replace(/\{mediaTypeExtension\}$/, extension)
          var pathParts = [pathName].concat(part.slice(1))

          return recursiveExtractPaths(obj, pathParts)
        })
      }

      part = part.slice(0, -20) + '.{mediaTypeExtension}'
    }

    if (part !== '/') {
      if (obj.children.hasOwnProperty(part)) {
        obj = obj.children[part]
      } else {
        var uriParams = parameters(part, params)
        var absoluteUri = obj.absoluteUri + part

        obj = obj.children[part] = map[absoluteUri] = {
          parent: obj,
          methods: {},
          children: {},
          relativeUri: part,
          absoluteUri: absoluteUri,
          relativeUriParameters: uriParams,
          absoluteUriParameters: extend({}, obj.absoluteUriParameters, uriParams)
        }
      }
    }

    if (parts.length > 1) {
      recursiveExtractPaths(obj, parts.slice(1), resource)

      return
    }

    compile(obj, resource)
  }

  function attachResource (parent, path, resource) {
    var parts = path.split(options.splitUri)

    recursiveExtractPaths(parent, parts, resource)
  }

  function attachMethod (obj, name, method) {
    var securedBy = (method && method.securedBy) || raml.securedBy

    obj.methods[name] = extend({
      parent: obj
    }, method, {
      securedBy: sanitizeSecuredBy(securedBy, raml.securitySchemes)
    })
  }

  function compile (obj, resources) {
    Object.keys(resources).forEach(function (key) {
      if (/^\//.test(key)) {
        attachResource(obj, key, resources[key])

        return
      }

      if (key === 'type' || key === 'is') {
        return // Apply later
      }

      attachMethod(obj, key, resources[key])
    })

    // TODO: Apply type and traits.
  }

  if (raml.resources) {
    compile(root, raml.resources)
  }

  return map
}

function createBaseUriParameters (raml) {
  var params = parameters(raml.baseUri, raml.baseUriParameters)

  params.version = extend({
    type: 'string',
    default: raml.version
  }, params.version)

  return params
}

function sanitizeSecuredBy (securedBy, securitySchemes) {
  var map = {}

  securedBy.forEach(function (name) {
    if (name == null) {
      map['null'] = { type: 'Anonymous' }

      return
    }

    if (typeof name === 'string') {
      map[name] = securitySchemes[name]

      return
    }

    Object.keys(name).forEach(function (key) {
      map[key] = extend({}, securitySchemes[key])
      map[key].settings = extend({}, securitySchemes[key].settings, name[key])
    })
  })

  return map
}
