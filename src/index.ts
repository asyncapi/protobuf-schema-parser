import type {ParseSchemaInput, SchemaParser, SchemaValidateResult, ValidateSchemaInput} from '@asyncapi/parser';
import {proto2jsonSchema} from './protoj2jsonSchema';
import type {AsyncAPISchema} from '@asyncapi/parser/esm/types';

export function ProtoBuffSchemaParser(): SchemaParser {
  return {
    validate,
    parse,
    getMimeTypes,
  };
}

export default ProtoBuffSchemaParser;

async function validate(input: ValidateSchemaInput<unknown, unknown>): Promise<SchemaValidateResult[]> {
  try {
    proto2jsonSchema(input.data as string);

    // No errors found.
    return [];
  } catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) {
      message = error.message;
    }

    return [{
      message,
      path: input.path, // protobuf parser doesn't provide a path to the error.
    }];
  }
}

function parse(input: ParseSchemaInput<unknown, unknown>): AsyncAPISchema {
  return proto2jsonSchema(input.data as string);
}

function getMimeTypes() {
  return [
    'application/vnd.google.protobuf;version=2',
    'application/vnd.google.protobuf;version=3',
  ];
}

