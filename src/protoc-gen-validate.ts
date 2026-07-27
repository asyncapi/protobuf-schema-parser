/* eslint-disable sonarjs/cognitive-complexity */
import {AsyncAPISchemaDefinition} from '@asyncapi/parser/esm/spec-types/v3';
import {Field} from 'protobufjs';
import {findRootOption, protocGenValidate} from './protovalidate';

const OPTION_PREFIX = '(validate.rules)';

export function visit(obj: AsyncAPISchemaDefinition, field: Field) {
  const parsedOption = findRootOption(field, OPTION_PREFIX);

  if (parsedOption !== null) {
    protocGenValidate(parsedOption, obj);
  }
}

