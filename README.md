# Raml Object Standard

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

A standardized RAML object representation using JSON schema.

## Installation

```sh
npm install raml-object-standard --save
```

## Usage

### New Parsers

Use the `schema.json` to validate your parser is standard.

### Old Parsers

Use a transform from the `transform` directory that works with your existing parser. Current implementations:

* [RAML JS Parser](https://github.com/raml-org/raml-js-parser) - `transform/raml-js-parser-08.js`

## License

Apache License 2.0

[npm-image]: https://img.shields.io/npm/v/raml-object-standard.svg?style=flat
[npm-url]: https://npmjs.org/package/raml-object-standard
[downloads-image]: https://img.shields.io/npm/dm/raml-object-standard.svg?style=flat
[downloads-url]: https://npmjs.org/package/raml-object-standard
[travis-image]: https://img.shields.io/travis/mulesoft-labs/raml-object-standard.svg?style=flat
[travis-url]: https://travis-ci.org/mulesoft-labs/raml-object-standard
[coveralls-image]: https://img.shields.io/coveralls/mulesoft-labs/raml-object-standard.svg?style=flat
[coveralls-url]: https://coveralls.io/r/mulesoft-labs/raml-object-standard?branch=master
