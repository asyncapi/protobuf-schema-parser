# AGENTS.md

Guidance for human contributors and AI coding agents working in this repository. This project is
`@asyncapi/protobuf-schema-parser`: an [`@asyncapi/parser`](https://github.com/asyncapi/parser-js)
schema-parser plugin that converts Protocol Buffers (`.proto`) message definitions into AsyncAPI
(JSON Schema based) schemas.

Keep changes focused, factual and consistent with the conventions below. When behaviour changes,
update or add a fixture (see section 6) so the mapping stays covered by tests.

## 1. Technology Stack

- **Language:** TypeScript (compiled with `tsc`, `strict` mode on).
- **Runtime:** Node.js `>= 18`. The library is also browser-compatible (`sideEffects: false`), so
  avoid Node-only APIs in `src/` outside of test code.
- **Core dependencies:**
  - `@asyncapi/parser` — the host parser this plugin registers with; source of the `SchemaParser`
    type and the schema types under `@asyncapi/parser/esm/...`.
  - `protobufjs` — parses the raw `.proto` string into a reflection tree.
  - `@types/protocol-buffers-schema` — type definitions.
- **Build output:** dual module builds — ES modules in `esm/` (`build:esm`) and CommonJS in `cjs/`
  (`build:cjs`). `package.json` points `main` at `cjs/`, `module` at `esm/`, and `types` at
  `esm/index.d.ts`.
- **Tooling:** Jest (`@swc/jest`) for tests, ESLint for linting, `semantic-release` for releases,
  `markdown-toc` for the README table of contents.

## 2. Project Structure

```
src/
  index.ts                 Parser factory + @asyncapi/parser schema-parser contract
  protoj2jsonSchema.ts     Core converter (Proto2JsonSchema class)
  primitive-types.ts       Scalar Protobuf -> JSON Schema type/format map
  google-types.ts          Bundled google/type/*.proto definitions
  pathUtils.ts             Import path resolution helpers
  protoc-gen-validate.ts   (validate.rules) option mapping
  protovalidate.ts         (buf.validate.field) option mapping + shared validator logic
test/
  parser.spec.ts           Test suite
  documents/*.yaml         AsyncAPI input fixtures
  documents/*.result.json  Expected parsed output for each fixture
esm/  cjs/                 Generated build output (do not edit by hand; git-ignored)
```

Edit only `src/` and `test/`. Never hand-edit `esm/` or `cjs/` — they are produced by the build and
are git-ignored.

## 3. Coding Standards & Conventions

- Follow `.editorconfig` and `.eslintrc`: 2-space indentation, single quotes, semicolons required,
  LF line endings, final newline, `no-var`, `prefer-const`, `object-shorthand`, `prefer-template`.
- Run `npm run lint` (or `npm run lint:fix`) before proposing changes. Lint must pass with
  `--max-warnings 0`.
- Prefer small, private helper methods on the converter class over deeply nested logic. The
  `sonarjs/cognitive-complexity` rule is a warning; where a function is unavoidably complex, the
  codebase disables it with a scoped `eslint-disable` comment rather than leaving warnings.
- Preserve the existing use of non-standard `x-` keywords (see section 5) — they are part of the
  output contract that downstream tooling relies on.
- Keep the library free of Node-only or filesystem APIs (browser compatibility). File reads belong in
  tests only.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) — releases are
  driven by the commit prefix (`fix:`, `feat:`, `docs:`, `chore:`, `test:`, `refactor:`; add `!` for
  breaking changes).

## 4. The schema-parser contract

`src/index.ts` exports `ProtoBuffSchemaParser()` (both a named and the default export). It returns an
object implementing the `SchemaParser` interface from `@asyncapi/parser`:

- **`getMimeTypes()`** — returns the schema formats this parser handles:
  `application/vnd.google.protobuf;version=2` and `application/vnd.google.protobuf;version=3`.
  `@asyncapi/parser` routes any message payload whose `schemaFormat` matches one of these strings to
  this parser.
- **`parse(input)`** — receives `input.data` (the raw Protobuf string) and returns the converted
  AsyncAPI schema. Delegates to `proto2jsonSchema(input.data)`.
- **`validate(input)`** — returns `Promise<SchemaValidateResult[]>`. An empty array means valid; any
  parse error is caught and returned as a single result with `message` and `input.path` (the
  Protobuf parser does not provide an error path).

A consumer registers the parser with `parser.registerSchemaParser(ProtoBuffSchemaParser())`. Keep
this three-method surface stable; changing method names or the MIME-type strings is a breaking
change.

## 5. Protobuf -> AsyncAPI mapping rules

The converter (`src/protoj2jsonSchema.ts`, class `Proto2JsonSchema`) parses the schema with
`protobufjs` (options `keepCase: true`, `alternateCommentMode: true`), resolves the root message, and
walks the tree. Core rules:

- **Message** -> `{ title, type: 'object', properties, required }`. The `required` array is dropped
  when empty. The message comment becomes `description`.
- **Root selection** -> the message not used as a field type by any other message is the root. If
  more than one candidate remains, one must be annotated `@RootNode`, else throw `Found more than one
  root proto messages`. Zero candidates throws `Not found a root proto messages`.
- **Scalar field** -> looked up in `PrimitiveTypes.PRIMITIVE_TYPES_WITH_LIMITS` (or
  `PRIMITIVE_TYPES_MINIMAL` when `primitiveTypesWithLimits` is `false`); sets `type`, `format`,
  `x-primitive`, and numeric `minimum`/`maximum` where defined.
- **Message-typed field** -> the referenced message compiled inline, plus `x-type` = Protobuf type
  name. A comment on the field replaces the inlined `description` and moves the message's own
  comment to `x-type-description`, so consumers documenting the type itself never read a field
  comment.
- **Enum** -> `{ title, type: 'string', enum: [names], 'x-enum-mapping': { name: number } }`; a field
  referencing an enum also gets `x-type`.
- **`repeated` field** -> `{ type: 'array', items: <field schema> }`. Supports `@MinItems`/`@MaxItems`
  and validator-framework `min_items`/`max_items`/`unique`/`items`.
- **`oneof` with 2+ members** -> a property named after the `oneof` holding `{ oneOf: [...] }`; each
  variant carries `x-oneof-item` = originating field name. Single-member synthetic `oneof`s (proto3
  `optional`, names starting with `_`) are filtered out.
- **Required membership** is additive: proto2 `required`, non-optional proto3 field, or `@Required`.
- **Recursion guard**: if a message type appears twice on the current stack branch, stop descending.
- **Comments** become `description` after `@`-annotations are stripped. Field annotations
  (`@Min`/`@Max`/`@Pattern`/`@ExclusiveMinimum`/`@ExclusiveMaximum`/`@MultipleOf`/`@MinLength`/
  `@MaxLength`/`@MinItems`/`@MaxItems`/`@Default`/`@Example`/`@Required`) map to the corresponding
  JSON Schema keywords.
- **Head `@Option`** annotations configure the converter (currently only
  `primitiveTypesWithLimits`).
- **Validation frameworks**: `(validate.rules)` (protoc-gen-validate, `src/protoc-gen-validate.ts`)
  and `(buf.validate.field)` (protovalidate, `src/protovalidate.ts`) are translated to JSON Schema
  validators (`const`, `lt`/`lte`/`gt`/`gte` -> exclusive/inclusive `minimum`/`maximum`,
  `in`/`not_in` -> `oneOf`/`not`, string length/pattern/format rules, `ignore_empty` -> optional).

**Imports/refs** are unsupported except the bundled well-known definitions (`google/protobuf/*` via
`protobufjs`, `google/type/*` via `google-types.ts`, and the two validation `.proto` files). Any
other `import` throws.

The `x-` keywords (`x-primitive`, `x-type`, `x-type-description`, `x-enum-mapping`, `x-oneof-item`)
are an intentional part of the output. Do not remove or rename them without treating it as a
breaking change.

## 6. Testing

- Tests live in `test/parser.spec.ts` and run via `npm test` (`jest --coverage`).
- Each case parses an AsyncAPI YAML fixture from `test/documents/*.yaml` through a real
  `@asyncapi/parser` `Parser` with `ProtoBuffSchemaParser` registered, then deep-equals the result
  against the matching `*.result.json` (with `x-parser-*` internals stripped).
- When you change the mapping, add or update a fixture pair (`<name>.yaml` + `<name>.result.json`). To
  regenerate expected outputs, temporarily set `UPDATE_RESULTS = true` in `parser.spec.ts`, run the
  suite, review the diff, then set it back to `false`. Never commit with `UPDATE_RESULTS = true`.
- Invalid-input fixtures (e.g. `invalid.multiple_root.yaml`, `invalid.schema-empty.yaml`) assert that
  parsing fails and produces diagnostics. Add negative cases for new error conditions.
- Cover both proto2 and proto3 where relevant, and keep the `google` well-known-type and validation
  fixtures green when touching import handling or the validator mappers.

## 7. Project-specific patterns & invariants

- A converted payload always has exactly one root object (JSON Schema has a single root). Multiple
  unparented messages require `@RootNode` disambiguation.
- The converter runs synchronously; `parse` returns the schema value directly (the `SchemaParser`
  interface also permits a Promise).
- `protobufjs` is parsed with `keepCase: true` — field/enum names are preserved verbatim; do not
  camel-case them.
- The scalar map is the single source of truth for scalar output. Derive the "minimal" (no
  `minimum`/`maximum`) variant from the "with limits" map rather than duplicating entries.
- Error messages are user-facing (surfaced through `validate` diagnostics) — keep them clear and
  specific.
- Keep `README.md` in sync with mapping/annotation/option changes, and regenerate its table of
  contents with `npm run generate:readme:toc` when headings change.

## 8. Example

Input (Protobuf embedded in an AsyncAPI message payload):

```proto
message Point {
  int32 x = 1;
  int32 y = 2;
  optional string label = 3;
}
```

Output (converted AsyncAPI schema, abbreviated):

```json
{
  "title": "Point",
  "type": "object",
  "required": ["x", "y"],
  "properties": {
    "x": { "type": "integer", "format": "int32", "minimum": -2147483648, "maximum": 2147483647, "x-primitive": "int32" },
    "y": { "type": "integer", "format": "int32", "minimum": -2147483648, "maximum": 2147483647, "x-primitive": "int32" },
    "label": { "type": "string", "x-primitive": "string" }
  }
}
```

## Related projects

Public AsyncAPI and Protobuf ecosystem projects only:

- [`@asyncapi/parser`](https://github.com/asyncapi/parser-js) — the host parser this plugin extends.
- [Protocol Buffers](https://protobuf.dev/) — the input schema language.
- [`protobufjs`](https://github.com/protobufjs/protobuf.js) — the underlying `.proto` parser.
- [protoc-gen-validate](https://github.com/bufbuild/protoc-gen-validate) and
  [protovalidate](https://github.com/bufbuild/protovalidate) — supported validation frameworks.
