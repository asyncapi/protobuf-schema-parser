import {AsyncAPISchemaDefinition} from '@asyncapi/parser/esm/spec-types/v3';

export interface AsyncApiTypeMap {
  [key: string]: AsyncAPISchemaDefinition;
}

/**
 * copied from: https://raw.githubusercontent.com/vipszx/protobuf-jsonschema/master/types.js
 */
export class PrimitiveTypes {
  private static readonly MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
  private static readonly MIN_SAFE_INTEGER = -this.MAX_SAFE_INTEGER;

  public static readonly PRIMITIVE_TYPES: AsyncApiTypeMap = {
    bytes: {
      type: 'string',
      'x-primitive': 'bytes',
    },
    string: {
      type: 'string',
      'x-primitive': 'string',
    },
    bool: {
      type: 'boolean',
      'x-primitive': 'bool',
    },
    int32: {
      type: 'integer',
      minimum: -0x80000000,
      maximum: 0x7fffffff,
      'x-primitive': 'int32',
    },
    sint32: {
      type: 'integer',
      minimum: -0x80000000,
      maximum: 0x7fffffff,
      'x-primitive': 'sint32',
    },
    uint32: {
      type: 'integer',
      minimum: 0,
      maximum: 0xffffffff,
      'x-primitive': 'uint32',
    },
    int64: {
      type: 'integer',
      minimum: this.MIN_SAFE_INTEGER,
      maximum: this.MAX_SAFE_INTEGER,
      'x-primitive': 'int64',
    },
    sint64: {
      type: 'integer',
      minimum: this.MIN_SAFE_INTEGER,
      maximum: this.MAX_SAFE_INTEGER,
      'x-primitive': 'sint64',
    },
    uint64: {
      type: 'integer',
      minimum: 0,
      maximum: this.MAX_SAFE_INTEGER,
      'x-primitive': 'uint64',
    },
    fixed32: {
      type: 'number',
      'x-primitive': 'fixed32',
    },
    fixed64: {
      type: 'number',
      'x-primitive': 'fixed64',
    },
    sfixed32: {
      type: 'number',
      'x-primitive': 'sfixed32',
    },
    sfixed64: {
      type: 'number',
      'x-primitive': 'sfixed64',
    },
    float: {
      type: 'number',
      'x-primitive': 'float',
    },
    double: {
      type: 'number',
      'x-primitive': 'double',
    },
  };
}
