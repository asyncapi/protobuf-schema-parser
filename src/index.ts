import type { SchemaParser, ParseSchemaInput, ValidateSchemaInput, SchemaValidateResult, SpecTypesV2 } from '@asyncapi/parser';
import { protoj2jsonSchema } from './protoj2jsonSchema';
import { parse as proto2protoj } from 'protocol-buffers-schema';

export function ProtoBuffSchemaParser(): SchemaParser {
  return {
    validate,
    parse,
    getMimeTypes,
  };
}
export default ProtoBuffSchemaParser;

async function validate(input: ValidateSchemaInput<unknown, unknown>): Promise<SchemaValidateResult[]> {
  const payload = input.data as string;

  try {
    protoj2jsonSchema(
      proto2protoj(payload),
      {
        getOne: true,
      }
    );

    // No errors found.
    return [];
  } catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) {
      message = error.message;
    }

    const validateResult: SchemaValidateResult[] = [{
      message,
      path: input.path, // protobuff parser doesn't provide a path to the error.
    }];

    return validateResult;
  }
}

async function parse(input: ParseSchemaInput<unknown, unknown>): Promise<SpecTypesV2.SchemaObject> {
  const payload = input.data as string;

  return protoj2jsonSchema(
    proto2protoj(payload),
    {
      getOne: true,
    }
  );
}

function getMimeTypes() {
  return [
    'application/vnd.google.protobuf;version=2',
    'application/vnd.google.protobuf;version=3',
  ];
}

