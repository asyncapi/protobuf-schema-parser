# ProtoBuff Data Types Schema Parser

[![npm version](https://img.shields.io/npm/v/@asyncapi/protobuf-schema-parser.svg)](https://www.npmjs.com/package/@asyncapi/protobuf-schema-parser)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)

A schema parser for [Protocol Buffers](https://protobuf.dev/) data types. It plugs into
[`@asyncapi/parser`](https://github.com/asyncapi/parser-js) and lets you embed `.proto` message
definitions directly in the `payload` (or `schema`) of an AsyncAPI document. During parsing, the
Protobuf definition is converted into an AsyncAPI (JSON Schema based) schema so the rest of the
AsyncAPI tooling can work with it like any other message payload.

## Overview

AsyncAPI messages can carry payloads described in different schema languages. `@asyncapi/parser`
delegates any payload whose `schemaFormat` it does not understand natively to a registered
_schema parser_. This package is the schema parser for Protocol Buffers: you register it once, and
every message payload tagged with a Protobuf `schemaFormat` is parsed and expanded in place into an
equivalent AsyncAPI schema.

- Works with **Protobuf 2 and Protobuf 3** schemas.
- Registers for the schema formats
  `application/vnd.google.protobuf;version=2` and `application/vnd.google.protobuf;version=3`.
- Maps Protobuf messages, scalars, enums, `repeated` fields, `oneof` and nested types to JSON Schema.
- Understands leading comments as descriptions and a set of `@`-annotations for validation, defaults
  and examples.
- Optionally maps [protoc-gen-validate](https://github.com/bufbuild/protoc-gen-validate) and
  [protovalidate](https://github.com/bufbuild/protovalidate) rules to JSON Schema validators.
- Browser-compatible and ships both CommonJS and ES module builds.

> There is no strict distinction between Protobuf 2 and 3. Declaring `schemaFormat` as
> `application/vnd.google.protobuf;version=2` while providing a proto3 schema (or vice versa) does
> not by itself cause an error.
>
> Version `>= 2.0.0` of this package requires `@asyncapi/parser` `>= 2.0.0`; the `3.x` line targets
> `@asyncapi/parser` `>= 3.6.0`.

<!-- toc -->

- [Installation](#installation)
- [Usage](#usage)
- [Supported input](#supported-input)
- [How it works](#how-it-works)
- [Scalar type formats](#scalar-type-formats)
- [Comments and annotations](#comments-and-annotations)
  * [Per field annotation](#per-field-annotation)
  * [Per message annotation](#per-message-annotation)
  * [Head annotation](#head-annotation)
  * [Head annotation "Option"](#head-annotation-option)
- [Supported validation frameworks](#supported-validation-frameworks)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

<!-- tocstop -->

## Installation

```sh
npm install @asyncapi/protobuf-schema-parser
# or
yarn add @asyncapi/protobuf-schema-parser
```

`@asyncapi/parser` is required to use this package. Requires Node.js `>= 18`.

## Usage

Create a `Parser`, register the Protobuf schema parser on it, then parse an AsyncAPI document that
uses a Protobuf `schemaFormat`. The Protobuf source goes into the message `payload` as a string.

```ts
import { Parser } from '@asyncapi/parser';
import { ProtoBuffSchemaParser } from '@asyncapi/protobuf-schema-parser';

const parser = new Parser();
parser.registerSchemaParser(ProtoBuffSchemaParser());

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
`;

const { document, diagnostics } = await parser.parse(asyncapiWithProto);
```

The same works with CommonJS:

```js
const { Parser } = require('@asyncapi/parser');
const { ProtoBuffSchemaParser } = require('@asyncapi/protobuf-schema-parser');

const parser = new Parser();
parser.registerSchemaParser(ProtoBuffSchemaParser());
```

Notes:

- `ProtoBuffSchemaParser` is exported both as a named export and as the default export. Call it to
  obtain the parser instance, then pass that instance to `registerSchemaParser`.
- Place your Protobuf schema as a string in the message `payload` (AsyncAPI 2.x) or in the schema
  object's `schema` keyword (AsyncAPI 3.x) to get it parsed. See the fixtures under
  [`test/documents`](./test/documents) for both variants.
- After parsing, the message payload in `document` is the converted AsyncAPI schema.

## Supported input

- **Protobuf 2 and Protobuf 3** message definitions.
- The two registered schema formats:
  - `application/vnd.google.protobuf;version=2`
  - `application/vnd.google.protobuf;version=3`

References are **not** supported:

- No support for `$ref` inside the Protobuf payload.
- No support for [`import`](https://protobuf.dev/programming-guides/proto3/#importing-definitions),
  with the exception of the bundled well-known definitions:
  - `google/protobuf/*` (provided by `protobufjs`)
  - `google/type/*` (bundled with this package)
  - the validation definitions `validate/validate.proto` and `buf/validate/validate.proto`

Any other `import` throws an error during parsing.

## How it works

Each AsyncAPI document may contain several message payloads. For every payload whose `schemaFormat`
matches one of the registered MIME types, the parser hands the raw Protobuf string to the converter,
which uses [`protobufjs`](https://github.com/protobufjs/protobuf.js) to parse it and then walks the
message tree, emitting a JSON Schema based AsyncAPI schema.

Because a JSON Schema has a single root, the converter first determines the **root message**: the
message that is not referenced as a field type by any other message. If several candidates remain,
annotate the intended root with `@RootNode`; otherwise parsing fails with `Found more than one root
proto messages`. If no root can be found, parsing fails with `Not found a root proto messages`.

The main mapping rules:

| Protobuf construct | AsyncAPI / JSON Schema output |
|--------------------|-------------------------------|
| `message` | `{ "title": <name>, "type": "object", "properties": { ... } }`, plus a `required` list |
| Scalar field (e.g. `int32`, `string`) | `type` + `format` from the [scalar type map](#scalar-type-formats), plus `x-primitive` (and `minimum`/`maximum` for numeric types) |
| Message-typed field | The referenced message compiled inline, plus `x-type` set to the Protobuf type name |
| `enum` | `{ "type": "string", "enum": [<names>], "x-enum-mapping": { <name>: <number> } }` |
| `repeated` field | `{ "type": "array", "items": <field schema> }` |
| `oneof` with 2+ members | A property named after the `oneof` holding `{ "oneOf": [ ... ] }`; each variant carries `x-oneof-item` with the field name |
| Field / message comment | `description` (with `@`-annotations stripped out). A field comment replaces the comment of the message it references, which moves to `x-type-description` |

Field membership in the `required` list is additive: a field is marked required if it is proto2
`required`, a non-optional proto3 field, or annotated with `@Required`.

Recursive messages are supported: when the same message type is encountered twice on the current
branch, the converter stops descending to avoid an infinite loop.

Non-standard (`x-`) keywords are used to preserve Protobuf information that has no direct JSON Schema
equivalent: `x-primitive` (original scalar type), `x-type` (referenced message/enum name),
`x-type-description` (comment of the referenced message when a field comment replaced it),
`x-enum-mapping` (enum name to numeric value), and `x-oneof-item` (the `oneof` field a variant came
from).

## Scalar type formats

Each Protobuf scalar type is mapped to a JSON Schema `type` plus a `format` that preserves the
original Protobuf wire type. For example `int64` becomes `{"type": "integer", "format": "int64"}`
and `bytes` becomes `{"type": "string", "format": "bytes"}`. The Protobuf type is additionally kept
in the non-standard `x-primitive` keyword. By default numeric types also carry `minimum`/`maximum`
limits (see the `primitiveTypesWithLimits` option).

## Comments and annotations

Each field of a message may have a comment which is reflected as the JSON Schema `description`.
Furthermore, the comment can contain the following annotations:

```proto
message Point {
    /*
     * The coordinate on the x axis.
     * @Default 99
     * @Min 0
     * @Max 100
     */
    required int32 x = 1;

    /*
     * The coordinate on the y axis.
     * @Default 12
     * @Min 0
     * @Max 100
     */
    required int32 y = 2;
    optional string label = 3;
}
```

### Per field annotation

| annotation | description |
|------------|:------------|
| @Example | JSON Schema `examples` keyword. Can appear multiple times. If used with a complex type, a single-line JSON object has to be used. |
| @Min or @Minimum | JSON Schema [numeric validator](https://json-schema.org/understanding-json-schema/reference/numeric#range) |
| @Max or @Maximum | JSON Schema [numeric validator](https://json-schema.org/understanding-json-schema/reference/numeric#range) |
| @Pattern | JSON Schema [string validator](https://json-schema.org/understanding-json-schema/reference/string#regexp) |
| @ExclusiveMinimum | JSON Schema [numeric validator](https://json-schema.org/understanding-json-schema/reference/numeric#range) |
| @ExclusiveMaximum | JSON Schema [numeric validator](https://json-schema.org/understanding-json-schema/reference/numeric#range) |
| @MultipleOf | JSON Schema [numeric validator](https://json-schema.org/understanding-json-schema/reference/numeric#multiples) |
| @MinLength | JSON Schema [string validator](https://json-schema.org/understanding-json-schema/reference/string#length) |
| @MaxLength | JSON Schema [string validator](https://json-schema.org/understanding-json-schema/reference/string#length) |
| @MinItems | JSON Schema [array validator](https://json-schema.org/understanding-json-schema/reference/array#length) |
| @MaxItems | JSON Schema [array validator](https://json-schema.org/understanding-json-schema/reference/array#length) |
| @Default | JSON Schema [default value](https://json-schema.org/understanding-json-schema/reference/annotations) |
| @Required | Adds the field to the JSON Schema `required` list. Additive: a field is required if it is proto2 `required`, a non-optional proto3 field, or annotated with `@Required`. |

### Per message annotation

| annotation | description |
|------------|:------------|
| @RootNode | If there are multiple types without a parent, you can give a hint about the root node with this annotation. |

### Head annotation

| annotation | description |
|------------|:------------|
| @Option | In the head of your file you can place options for the parser. |

### Head annotation "Option"

The `@Option` has to be followed by a space-separated option key and a space-separated value.

```proto
// @Option primitiveTypesWithLimits false

message Point {

}
```

Possible options are:

| option | description | default |
|--------|:------------|:--------|
| primitiveTypesWithLimits | If you do not want default `minimum`/`maximum` limits for primitive types, set this option to `false`. | true |

## Supported validation frameworks

If you would like to add additional validation to your proto files, you can use one of the following
validation frameworks. Their rules are translated into JSON Schema validation keywords during
parsing.

- [protoc-gen-validate](https://github.com/bufbuild/protoc-gen-validate) — validation of lists is not
  100% supported.
- [protovalidate](https://github.com/bufbuild/protovalidate)

## Development

This project is written in TypeScript and builds both an ES module (`esm/`) and a CommonJS (`cjs/`)
output. Tests use [Jest](https://jestjs.io/) against snapshot-style fixtures in `test/documents`.

```sh
npm install          # install dependencies

npm run build        # build both esm/ and cjs/ (build:esm, build:cjs)
npm test             # run the Jest test suite with coverage
npm run lint         # run ESLint (use lint:fix to auto-fix)
```

Source layout:

| Path | Purpose |
|------|---------|
| `src/index.ts` | Parser factory; implements the `@asyncapi/parser` schema-parser contract (`parse`, `validate`, `getMimeTypes`). |
| `src/protoj2jsonSchema.ts` | Core converter that turns a Protobuf schema into an AsyncAPI schema. |
| `src/primitive-types.ts` | Scalar Protobuf type to JSON Schema `type`/`format` map. |
| `src/google-types.ts` | Bundled `google/type/*` well-known definitions. |
| `src/pathUtils.ts` | Import path resolution helpers. |
| `src/protoc-gen-validate.ts` | Maps `(validate.rules)` options to JSON Schema validators. |
| `src/protovalidate.ts` | Maps `(buf.validate.field)` options to JSON Schema validators. |
| `test/documents/*.yaml` | AsyncAPI input fixtures; `*.result.json` are the expected parsed outputs. |

## Contributing

Read [CONTRIBUTING](./CONTRIBUTING.md) to learn about the contribution process and the AsyncAPI
[Code of Conduct](./CODE_OF_CONDUCT.md). Issues and pull requests are welcome.

## License

[Apache-2.0](./LICENSE)
