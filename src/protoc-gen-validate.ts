/* eslint-disable sonarjs/cognitive-complexity */
import {AsyncAPISchemaDefinition} from '@asyncapi/parser/esm/spec-types/v3';
import {Field} from 'protobufjs';
import {findRootOption, protocGenValidate} from './protovalidate';

const OPTION_PREFIX = '(validate.rules)';
const RULE_TYPES_WITH_REQUIRED = ['message', 'duration', 'timestamp', 'any'];

export function visit(obj: AsyncAPISchemaDefinition, field: Field) {
  const parsedOption = findRootOption(field, OPTION_PREFIX);

  if (parsedOption !== null) {
    protocGenValidate(parsedOption, obj);
  }
}

export function isRequired(field: Field): boolean {
  const parsedOption = findRootOption(field, OPTION_PREFIX);
  if (parsedOption === null) {
    return false;
  }
  return RULE_TYPES_WITH_REQUIRED.some(ruleType => parsedOption[ruleType]?.required === true);
}

