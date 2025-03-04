/* eslint-disable sonarjs/cognitive-complexity */
import {AsyncAPISchemaDefinition} from '@asyncapi/parser/esm/spec-types/v3';
import {Field} from 'protobufjs';
import {protocGenValidate} from './protovalidate';

const OPTION_PREFIX = '(validate.rules)';

type HashMap = { [k: string]: any };

export function visit(obj: AsyncAPISchemaDefinition, field: Field) {
  const parsedOption = findRootOption(field);

  if (parsedOption !== null) {
    protocGenValidate(parsedOption, obj);
  }
}

function findRootOption(field: Field): null | HashMap {
  if (field.parsedOptions && field.parsedOptions[OPTION_PREFIX]) {
    return field.parsedOptions[OPTION_PREFIX] as any;
  } else if (field.parsedOptions && Array.isArray(field.parsedOptions)) {
    for (const parsedOption of field.parsedOptions) {
      if (parsedOption[OPTION_PREFIX]) {
        return parsedOption[OPTION_PREFIX];
      }
    }
  }
  return null;
}

