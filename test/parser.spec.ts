import {AsyncAPIDocumentInterface, Diagnostic, Parser,} from '@asyncapi/parser';
import * as fs from 'fs';
import * as path from 'path';
import {ProtoBuffSchemaParser} from '../src';

function stripParserExtraInfos(json: any): any {
  if (json === undefined || json === null) {
    return;
  }

  for (const [key, value] of Object.entries(json)) {
    if (key.startsWith('x-parser-')) {
      delete json[key];
      continue;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (typeof key[i] === 'object') {
          json[key][i] = stripParserExtraInfos(key[i]);
        }
      }
    } else if (typeof value === 'object') {
      json[key] = stripParserExtraInfos(value);
    }
  }

  return json;
}

function writeResults(
  document: AsyncAPIDocumentInterface | undefined,
  filename: string
) {
  fs.writeFileSync(
    path.resolve(__dirname, filename),
    JSON.stringify(stripParserExtraInfos(document?.json()), null, 2),
    'utf8'
  );
}

function readResultFile(filename: string) {
  return stripParserExtraInfos(JSON.parse(
    fs.readFileSync(path.resolve(__dirname, filename), 'utf8')
  ));
}

const UPDATE_RESULTS = false; // set to true for a single run if you change something and compare new target files manually with git tools

describe('parse()', function () {
  const parser = ProtoBuffSchemaParser();
  const coreParser = new Parser();
  coreParser.registerSchemaParser(parser);

  async function parseSpec(
    filename: string
  ): Promise<AsyncAPIDocumentInterface | undefined> {
    const {document, diagnostics} = await coreParser.parse(
      fs.readFileSync(path.resolve(__dirname, filename), 'utf8')
    );

    if (!document) {
      expect(filterDiagnostics(diagnostics, 'asyncapi2-schemas')).toHaveLength(
        0
      );
    }

    return document;
  }

  async function parseAndCompareWithResult(
    specFilename: string,
    resultFilename: string
  ): Promise<AsyncAPIDocumentInterface | undefined> {
    const document = await parseSpec(`./documents/${specFilename}`);

    if (UPDATE_RESULTS) {
      writeResults(document, `./documents/${resultFilename}`);
    }

    expect(
      stripParserExtraInfos(document?.json())
    ).toEqual(
      readResultFile(`./documents/${resultFilename}`)
    );

    return document;
  }

  it('should parse proto2 data types', async function () {
    await parseAndCompareWithResult('simple.proto2.yaml', 'simple.proto2.result.json');
  });

  it('should parse proto3 data types', async function () {
    await parseAndCompareWithResult('simple.proto3.yaml', 'simple.proto3.result.json');
  });

  it('should parse proto3 data types with imports and schema with same name in different namespaces', async function () {
    await parseAndCompareWithResult('complex.proto3.yaml', 'complex.proto3.result.json');
  });

  it('should parse proto data types including comments', async function () {
    await parseAndCompareWithResult('comments.proto.yaml', 'comments.proto.result.json');
  });

  it('should parse realworld train_run proto data types', async function () {
    await parseAndCompareWithResult('realworld.train_run.yaml', 'realworld.train_run.proto.result.json');
  });

  it('should parse value restriction and required annotations', async function () {
    await parseAndCompareWithResult('restrictions.proto.yaml', 'restrictions.proto.result.json');
  });

  it('multiple root messages in proto schema should fail', async function () {
    const {document, diagnostics} = await coreParser.parse(
      fs.readFileSync(path.resolve(__dirname, './documents/invalid.multiple_root.yaml'), 'utf8')
    );

    expect(document).toBeUndefined();

    expect(filterDiagnostics(diagnostics, 'asyncapi2-schemas')).not.toHaveLength(
      0
    );
  });

  it('no root messages in proto schema should fail', async function () {
    const {document, diagnostics} = await coreParser.parse(
      fs.readFileSync(path.resolve(__dirname, './documents/invalid.schema-empty.yaml'), 'utf8')
    );

    expect(document).toBeUndefined();

    expect(filterDiagnostics(diagnostics, 'asyncapi2-schemas')).not.toHaveLength(
      0
    );
  });

  it('recursion in proto should not lead to a infinity loop', async function () {
    await parseAndCompareWithResult('recursive.proto3.yaml', 'recursive.proto3.result.json');
  });

  it('protoc-gen-validate should added as correct validations', async function () {
    await parseAndCompareWithResult('protoc-gen-validate.yaml', 'protoc-gen-validate.result.json');
  });

  it('protovalidate should added as correct validations', async function () {
    await parseAndCompareWithResult('protovalidate-simple.yaml', 'protovalidate-simple.result.json');
  });

  it('a proto3 field should be required only when annotated or required by a validation rule', async function () {
    const document = await parseAndCompareWithResult('required.proto3.yaml', 'required.proto3.result.json');

    expect(document?.json().components.messages.testMessage.payload.required).toEqual([
      'annotated',
      'protovalidate_required',
      'protoc_gen_validate_required',
    ]);
  });

  it('a required label in a proto3 file should be ignored with a warning naming the field', async function () {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      await parseSpec('./documents/required.proto3.yaml');

      expect(warn).toHaveBeenCalledWith(expect.stringContaining('ignored on: proto2_label.'));
    } finally {
      warn.mockRestore();
    }
  });

  it('a field comment should replace and not extend the comment of the message it references', async function () {
    const document = await parseAndCompareWithResult('shared-message-type.proto.yaml', 'shared-message-type.proto.result.json');

    const properties = document?.json().components.messages.testMessage.payload.properties;

    expect(properties.origin.description).toEqual('Origin position.');
    expect(properties.deletion_position.description).toEqual('Position at which the train number is deleted.');
    expect(properties.uncommented_position.description).toEqual('Data type for a ZnvOccupancy');
    expect(properties.passed_positions.description).toEqual('All positions the train passed.');

    expect(properties.origin['x-type-description']).toEqual('Data type for a ZnvOccupancy');
    expect(properties.deletion_position['x-type-description']).toEqual('Data type for a ZnvOccupancy');
    expect(properties.passed_positions.items['x-type-description']).toEqual('Data type for a ZnvOccupancy');
  });

  function filterDiagnostics(diagnostics: Diagnostic[], code: string) {
    return diagnostics.filter((d) => d.code === code);
  }
});
