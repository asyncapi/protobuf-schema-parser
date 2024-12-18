/* eslint-disable sonarjs/cognitive-complexity */
import {AsyncAPISchemaDefinition} from '@asyncapi/parser/esm/spec-types/v3';
import {Field} from 'protobufjs';

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

function protocGenValidate(option: { [key: string]: any }, obj: AsyncAPISchemaDefinition) {
  for (const [optionKey, value] of Object.entries(option)) {
    switch (optionKey) {
    case 'float':
    case 'double':
    case 'int32':
    case 'int64':
    case 'uint32':
    case 'uint64':
    case 'sint32':
    case 'sint64':
    case 'fixed32':
    case 'fixed64':
    case 'sfixed32':
    case 'sfixed64':
      ProtocGenNumeric.handle(obj, value);
      break;

    case 'bool':
      ProtocGenBool.handle(obj, value);
      break;

    case 'string':
    case 'bytes':
      ProtocGenString.handle(obj, value);
      break;

    case 'repeated':
      ProtocGenRepeated.handle(obj, value);
      break;
    }
  }
}

// https://github.com/bufbuild/protoc-gen-validate/blob/main/tests/harness/cases/numbers.proto
class ProtocGenNumeric {
  public static handle(obj: AsyncAPISchemaDefinition, option: { [key: string]: number }) {
    for (const [optionKey, value] of Object.entries(option)) {
      switch (optionKey) {
      case 'const':
        ProtocGenGeneric.constValue(obj, value);
        break;
      case 'lt':
        ProtocGenNumeric.lessThan(obj, value);
        break;
      case 'lte':
        ProtocGenNumeric.lessEqualThan(obj, value);
        break;
      case 'gt':
        ProtocGenNumeric.greaterThan(obj, value);
        break;
      case 'gte':
        ProtocGenNumeric.greaterEqualThan(obj, value);
        break;
      case 'ignore_empty':
        // implemented via isOptional
        break;
      case 'in':
        ProtocGenGeneric.inArray(obj, value as any);
        break;
      case 'not_in':
        ProtocGenGeneric.notInArray(obj, value as any);
        break;
      }
    }
  }

  // x must equal `value` less than
  static lessThan(obj: AsyncAPISchemaDefinition, value: number) {
    delete obj.maximum;
    obj.exclusiveMaximum = value;
  }

  // x must be greater less or equal to `value`
  static lessEqualThan(obj: AsyncAPISchemaDefinition, value: number) {
    obj.maximum = value;
  }

  // x must equal `value` greater than
  static greaterThan(obj: AsyncAPISchemaDefinition, value: number) {
    delete obj.minimum;
    obj.exclusiveMinimum = value;
  }

  // x must be greater than or equal to `value`
  static greaterEqualThan(obj: AsyncAPISchemaDefinition, value: number) {
    obj.minimum = value;
  }
}

// https://github.com/bufbuild/protoc-gen-validate/blob/main/tests/harness/cases/bool.proto
class ProtocGenBool {
  public static handle(obj: AsyncAPISchemaDefinition, option: { [key: string]: boolean }) {
    for (const [optionKey, value] of Object.entries(option)) {
      switch (optionKey) {
      case 'const':
        ProtocGenGeneric.constValue(obj, value);
        break;
      }
    }
  }
}

// https://github.com/bufbuild/protoc-gen-validate/blob/main/tests/harness/cases/strings.proto
class ProtocGenString {
  public static handle(obj: AsyncAPISchemaDefinition, option: { [key: string]: string }) {
    for (const [optionKey, value] of Object.entries(option)) {
      switch (optionKey) {
      case 'const':
        ProtocGenGeneric.constValue(obj, value);
        break;

      case 'in':
        ProtocGenGeneric.inArray(obj, value as any);
        break;
      case 'not_in':
        ProtocGenGeneric.notInArray(obj, value as any);
        break;
      case 'len':
        ProtocGenString.len(obj, value as any);
        break;
      case 'min_len':
        ProtocGenString.minLen(obj, value as any);
        break;
      case 'max_len':
        ProtocGenString.maxLen(obj, value as any);
        break;
      case 'len_bytes':
        ProtocGenString.len(obj, value as any);
        break;
      case 'min_bytes':
        ProtocGenString.minLen(obj, value as any);
        break;
      case 'max_bytes':
        ProtocGenString.maxLen(obj, value as any);
        break;
      case 'pattern':
        ProtocGenString.pattern(obj, value);
        break;
      case 'prefix':
        ProtocGenString.prefix(obj, value);
        break;
      case 'contains':
        ProtocGenString.contains(obj, value);
        break;
      case 'not_contains':
        ProtocGenString.notContains(obj, value);
        break;
      case 'suffix':
        ProtocGenString.suffix(obj, value);
        break;
      case 'email':
        if (value) {
          ProtocGenString.email(obj);
        }
        break;
      case 'address':
        if (value) {
          ProtocGenString.address(obj);
        }
        break;
      case 'hostname':
        if (value) {
          ProtocGenString.hostname(obj);
        }
        break;
      case 'ip':
        if (value) {
          ProtocGenString.ip(obj);
        }
        break;
      case 'ipv4':
        if (value) {
          ProtocGenString.ipv4(obj);
        }
        break;
      case 'ipv6':
        if (value) {
          ProtocGenString.ipv6(obj);
        }
        break;
      case 'uri':
        if (value) {
          ProtocGenString.uri(obj);
        }
        break;
      case 'uri_ref':
        if (value) {
          ProtocGenString.uriRef(obj);
        }
        break;
      case 'uuid':
        if (value) {
          ProtocGenString.uuid(obj);
        }
        break;
      case 'well_known_regex':
        ProtocGenString.wellKnownRegex(obj, value);
        break;
      case 'ignore_empty':
        // implemented via isOptional
        break;
      }
    }
  }

  private static len(obj: AsyncAPISchemaDefinition, value: number) {
    obj.minLength = value;
    obj.maxLength = value;
  }

  private static minLen(obj: AsyncAPISchemaDefinition, value: number) {
    obj.minLength = value;
  }

  private static maxLen(obj: AsyncAPISchemaDefinition, value: number) {
    obj.maxLength = value;
  }

  private static pattern(obj: AsyncAPISchemaDefinition, value: string) {
    obj.pattern = value;
  }

  private static prefix(obj: AsyncAPISchemaDefinition, value: string) {
    obj.pattern = `^${escapeRegExp(value)}.*`;
  }

  private static contains(obj: AsyncAPISchemaDefinition, value: string) {
    obj.pattern = `.*${escapeRegExp(value)}.*`;
  }

  private static notContains(obj: AsyncAPISchemaDefinition, value: string) {
    obj.pattern = `^((?!${escapeRegExp(value)}).)*$`;
  }

  private static suffix(obj: AsyncAPISchemaDefinition, value: string) {
    obj.pattern = `.*${escapeRegExp(value)}$`;
  }

  private static email(obj: AsyncAPISchemaDefinition) {
    obj.format = 'email';
  }

  private static hostname(obj: AsyncAPISchemaDefinition) {
    obj.format = 'hostname';
  }

  private static address(obj: AsyncAPISchemaDefinition) {
    obj.anyOf = [
      {format: 'hostname'},
      {format: 'ipv4'},
      {format: 'ipv6'},
    ];
  }

  private static ip(obj: AsyncAPISchemaDefinition) {
    obj.anyOf = [
      {format: 'ipv4'},
      {format: 'ipv6'},
    ];
  }

  private static ipv4(obj: AsyncAPISchemaDefinition) {
    obj.format = 'ipv4';
  }

  private static ipv6(obj: AsyncAPISchemaDefinition) {
    obj.format = 'ipv6';
  }

  private static uri(obj: AsyncAPISchemaDefinition) {
    obj.format = 'uri';
  }

  private static uriRef(obj: AsyncAPISchemaDefinition) {
    obj.format = 'uri-reference';
  }

  private static uuid(obj: AsyncAPISchemaDefinition) {
    obj.format = 'uuid';
  }

  private static wellKnownRegex(obj: AsyncAPISchemaDefinition, value: string) {
    switch (value) {
    case 'HTTP_HEADER_NAME':
      obj.pattern = '^:?[0-9a-zA-Z!#$%&\'*+-.^_|~\x60]+$';
      break;
    case 'HTTP_HEADER_VALUE':
      obj.pattern = '^[^\u0000-\u0008\u000A-\u001F\u007F]*$';
      break;
    }
  }
}

// https://github.com/bufbuild/protoc-gen-validate/blob/main/tests/harness/cases/repeated.proto
class ProtocGenRepeated {
  public static handle(obj: AsyncAPISchemaDefinition, option: { [key: string]: string }) {
    for (const [optionKey, value] of Object.entries(option)) {
      switch (optionKey) {
      case 'min_items':
        ProtocGenRepeated.minLen(obj, value as any);
        break;
      case 'max_items':
        ProtocGenRepeated.maxLen(obj, value as any);
        break;
      case 'unique':
        if (value) {
          ProtocGenRepeated.unique(obj);
        }
        break;
      case 'items':
        if (obj.items) { // avoid null pointer
          protocGenValidate(value as any, obj.items as AsyncAPISchemaDefinition);
        }
        break;
      }
    }
  }

  private static minLen(obj: AsyncAPISchemaDefinition, value: number) {
    obj.minItems = value;
  }

  private static maxLen(obj: AsyncAPISchemaDefinition, value: number) {
    obj.maxItems = value;
  }

  private static unique(obj: AsyncAPISchemaDefinition) {
    obj.uniqueItems = true;
  }
}

class ProtocGenGeneric {
// x must equal `value` exactly
  public static constValue(obj: AsyncAPISchemaDefinition, value: string | number | boolean) {
    obj.const = value;
    delete obj.maximum;
    delete obj.minimum;
  }

  public static inArray(obj: AsyncAPISchemaDefinition, value: number[] | string[]) {
    if (!Array.isArray(value)) {
      throw new Error(`Expect value to be an array: ${value}`);
    }

    obj.oneOf = value.map(val => {
      const subSchema: AsyncAPISchemaDefinition = {
        const: val
      };
      return subSchema;
    });
  }

  public static notInArray(obj: AsyncAPISchemaDefinition, value: number[] | string[]) {
    if (!Array.isArray(value)) {
      throw new Error(`Expect value to be an array: ${value}`);
    }

    obj.not = {
      oneOf: value.map(val => {
        const subSchema: AsyncAPISchemaDefinition = {
          const: val
        };
        return subSchema;
      })
    };
  }
}

export function isOptional(field: Field) {
  const parsedOption = findRootOption(field);

  if (parsedOption !== null) {
    for (const [dataType, options] of Object.entries(parsedOption)) {
      if (dataType === 'repeated') {
        if (options.items) {
          for (const [key, val] of Object.entries(options.items)) {
            if (key === 'ignore_empty' && val) {
              return true;
            }
          }
        }
      } else {
        for (const [key, val] of Object.entries(options)) {
          if (key === 'ignore_empty' && val) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

function escapeRegExp(str: string): string {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}
