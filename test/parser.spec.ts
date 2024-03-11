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

  it('should parse proto2 data types', async function () {
    const document = await parseSpec('./documents/simple.proto2.yaml');

    if (UPDATE_RESULTS) {
      writeResults(document, './documents/simple.proto2.result.json');
    }

    expect(
      stripParserExtraInfos(document?.json())
    ).toEqual(
      readResultFile('./documents/simple.proto2.result.json')
    );
  });

  it('should parse proto3 data types', async function () {
    const document = await parseSpec('./documents/simple.proto3.yaml');

    if (UPDATE_RESULTS) {
      writeResults(document, './documents/simple.proto3.result.json');
    }

    expect(
      stripParserExtraInfos(document?.json())
    ).toEqual(
      readResultFile('./documents/simple.proto3.result.json')
    );
  });

  it('should parse proto3 data types with imports and schema with same name in different namespaces', async function () {
    const document = await parseSpec('./documents/complex.proto3.yaml');

    if (UPDATE_RESULTS) {
      writeResults(document, './documents/complex.proto3.result.json');
    }

    expect(
      stripParserExtraInfos(document?.json())
    ).toEqual(
      readResultFile('./documents/complex.proto3.result.json')
    );
  });

  it('should parse proto data types including comments', async function () {
    const document = await parseSpec('./documents/comments.proto.yaml');

    if (UPDATE_RESULTS) {
      writeResults(document, './documents/comments.proto.result.json');
    }

    expect(
      stripParserExtraInfos(document?.json())
    ).toEqual(
      readResultFile('./documents/comments.proto.result.json')
    );
  });

  it('should parse realworld train_run proto data types', async function () {
    const document = await parseSpec('./documents/realworld.train_run.yaml');

    if (UPDATE_RESULTS) {
      writeResults(
        document,
        './documents/realworld.train_run.proto.result.json'
      );
    }

    expect(
      stripParserExtraInfos(document?.json())
    ).toEqual(
      readResultFile('./documents/realworld.train_run.proto.result.json')
    );
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
    const document = await parseSpec('./documents/recursive.proto3.yaml');

    if (UPDATE_RESULTS) {
      writeResults(
        document,
        './documents/recursive.proto3.result.json'
      );
    }

    expect(
      stripParserExtraInfos(document?.json())
    ).toEqual(
      readResultFile('./documents/recursive.proto3.result.json')
    );
  });

  function filterDiagnostics(diagnostics: Diagnostic[], code: string) {
    return diagnostics.filter((d) => d.code === code);
  }
});
