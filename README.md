# ProtoBuff Data Types Schema Parser

A schema parser for Protocol Buffers data types.
For ProtoBuff 2 and 3 schemas.  

There is no explicit distinction between ProtoBuff 2 and 3. You dont have to expect any errors if your `schemaFormat` is `application/vnd.google.protobuf;version=2` defined, but your schema is proto3. 

Support for AsyncApi schema versions: 2

Compatible with: [@asyncapi/parser](https://www.npmjs.com/package/@asyncapi/parser) 1.x (tested with: 1.18.1)

This package is browser-compatible.


## Installation

```
npm install @asyncapi/protobuf-schema-parser
```

## Usage

```js
const parser = require('asyncapi-parser')
const protoParser = require('@asyncapi/protobuf-schema-parser')

const asyncapiWithProto = `
asyncapi: 2.0.0
info:
  title: Example with ProtoBuff
  version: 0.1.0
channels:
  example:
    publish:
      message:
        schemaFormat: 'application/vnd.google.protobuf;version=3'
        payload: |
            message Point {
                required int32 x = 1;
                required int32 y = 2;
                optional string label = 3;
            }

            message Line {
                required Point start = 1;
                required Point end = 2;
                optional string label = 3;
            }
`

parser.registerSchemaParser(protoParser)

await parser.parse(asyncapiWithProto)
```

Place your protoBuff schema as string in `payload` to get it parsed.

Refferences are NOT supported:
- no support for `$ref`
- no support for [`import`](https://protobuf.dev/programming-guides/proto3/#importing-definitions), except the default google types:
  - google/protobuf/*
  - google/type/*
  
