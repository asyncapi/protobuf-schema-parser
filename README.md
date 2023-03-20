# ProtoBuff Data Types Schema Parser

A schema parser for Protocol Buffers data types.

> **This package is browser-compatible.**

## Installation

```
npm install @asyncapi/proto-schema-parser
```

## Usage

```js
const parser = require('asyncapi-parser')
const protoParser = require('@asyncapi/proto-schema-parser')

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
