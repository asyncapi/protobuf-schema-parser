// base on https://raw.githubusercontent.com/vipszx/protobuf-jsonschema/master/index.js

import { SpecTypesV2 } from '@asyncapi/parser';
import { GoogleTypes } from './google-types';
import { AsyncApiTypeMap, PrimitiveTypes } from './primitive-types';
import { Enum, Message, Schema } from 'protocol-buffers-schema/types';

interface Root {
  definitions: AsyncApiTypeMap;
  used: {
    [key: string]: {
      base: SpecTypesV2.AsyncAPISchemaDefinition;
      key: string;
    };
  };
}

interface InternalHavingId {
  id: string;
}

interface InternalEnum extends Enum, InternalHavingId {}

interface InternalMessage extends Message, InternalHavingId {}

interface InternalSchema extends Schema, InternalHavingId {
  enums: InternalEnum[];
  messages: InternalMessage[];
}

class Proto2JsonSchema {
  private readonly protoBuffImports = [
    'google/protobuf/duration.proto',
    'google/protobuf/empty.proto',
    'google/protobuf/timestamp.proto',
    'google/protobuf/wrappers.proto',

    // https://github.com/googleapis/googleapis/tree/master/google/type
    'google/type/calendar_period.proto',
    'google/type/color.proto',
    'google/type/date.proto',
    'google/type/datetime.proto',
    'google/type/dayofweek.proto',
    'google/type/decimal.proto',
    'google/type/expr.proto',
    'google/type/fraction.proto',
    'google/type/interval.proto',
    'google/type/latlng.proto',
    'google/type/localized_text.proto',
    'google/type/money.proto',
    'google/type/month.proto',
    'google/type/phone_number.proto',
    'google/type/postal_address.proto',
    'google/type/quaternion.proto',
    'google/type/timeofday.proto',
  ];

  private messages: {
    [key: string]: InternalMessage;
  } = {};
  private enums: {
    [key: string]: InternalEnum;
  } = {};

  private options: Proto2JsonSchemaOptions;
  private schema: InternalSchema;
  private root: Root = {
    definitions: {},
    used: {},
  };

  constructor(schema: Schema, options: Proto2JsonSchemaOptions) {
    const _options = Object.assign(
      {
        getOne: false, // return just the single root object. Throws error if there are more than one root object. Will return only this items. insted of a list of items.
        forceInline: false, // force inlining, even if sub model is used multiple times.
        model: undefined, // Get a model from a single object.
      },
      options
    );

    if (_options.getOne) {
      _options.forceInline = true;
    }

    this.options = _options;
    this.schema = this.convert(schema);
  }

  private convert(schema: Schema): InternalSchema {
    this.visit(schema as InternalSchema, schema.package || '');

    for (const i of schema.imports) {
      if (this.protoBuffImports.indexOf(i) !== -1) {
        // Well known types, can be handled.
        continue;
      }

      throw new Error(`Protobuff imports are not supported: ${i}`);
    }

    return schema as InternalSchema;
  }

  /**
   * Visits a schema in the tree, and assigns messages and enums to the lookup tables.
   */
  private visit(schema: InternalSchema, prefix: string) {
    const that = this;
    if (schema.enums) {
      schema.enums.forEach((e) => {
        e.id = prefix + (prefix ? '.' : '') + (e.id || e.name);
        that.enums[e.id] = e;
        that.visit(e as any, e.id);
      }, this);
    }

    if (schema.messages) {
      schema.messages.forEach((m) => {
        m.id = prefix + (prefix ? '.' : '') + (m.id || m.name);
        that.messages[m.id] = m;
        that.visit(m as any, m.id);
      }, this);
    }
  }

  /**
   * Top level compile method. If a type name is provided,
   * compiles just that type and its dependencies. Otherwise,
   * compiles all types in the file.
   */
  public compile(): AsyncApiTypeMap | SpecTypesV2.AsyncAPISchemaObject {
    const that = this;

    this.root = {
      definitions: {},
      used: {},
    };

    if (this.options.getOne) {
      // Get the single defined root object
      const messagesNotUsedInOthers = this.findMessagesNotUsedInOthers();
      if (messagesNotUsedInOthers.length > 1) {
        throw new Error(
          `Option getOne is set but there are multple proto messages: ${messagesNotUsedInOthers.join(
            ','
          )}`
        );
      }

      if (messagesNotUsedInOthers.length < 1) {
        throw new Error('Option getOne is set but there are no proto messages');
      }

      this.options.model = messagesNotUsedInOthers[0];
    }

    if (this.options.model) {
      this.resolve(this.options.model, '');
    } else {
      this.schema.messages.forEach((message) => {
        that.resolve(message.id, '');
      }, this);

      this.schema.enums.forEach((e) => {
        that.resolve(e.id, '');
      }, this);
    }

    if (this.options.model && this.options.forceInline) {
      return this.root.definitions[this.options.model];
    }

    return this.root.definitions;
  }

  /**
   * Resolves a type name at the given path in the schema tree.
   * Returns a compiled JSON schema.
   */
  private resolve(
    type: string,
    from: string,
    base?: SpecTypesV2.AsyncAPISchemaDefinition | undefined,
    key?: string | undefined
  ) {
    if (PrimitiveTypes.PRIMITIVE_TYPES[type]) {
      return PrimitiveTypes.PRIMITIVE_TYPES[type];
    }

    if (GoogleTypes.GOOGLE_API_TYPES[type]) {
      return GoogleTypes.GOOGLE_API_TYPES[type];
    }

    if (GoogleTypes.WELL_KNOWN_TYPES[type]) {
      return GoogleTypes.WELL_KNOWN_TYPES[type];
    }

    for (const id of this.possibleIds(type, from)) {
      const res = this.resolveLevel(id, base, key);
      if (res) {
        return res;
      }
    }

    throw new Error(`Could not resolve ${type}`);
  }

  private possibleIds(type: string, from: string): string[] {
    const ids = [];
    const lookup = from.split('.');
    for (let i = lookup.length; i >= 0; i--) {
      ids.push(lookup.slice(0, i).concat(type).join('.'));
    }
    return ids;
  }

  private resolveLevel(
    id: string,
    base: SpecTypesV2.AsyncAPISchemaDefinition | undefined,
    key: string | undefined
  ) {
    // If this type was used before, move it from inline to a reusable definition
    if (
      this.root.used[id] &&
      !this.root.definitions[id] &&
      !this.options.forceInline
    ) {
      const k = this.root.used[id];
      this.root.definitions[id] = k.base[k.key];
      k.base[k.key] = this.root.definitions[id];
    }

    // If already defined, reuse
    if (this.root.definitions[id]) {
      return this.root.definitions[id];
    }

    // Compile the message or enum
    let res;
    if (this.messages[id]) {
      res = this.compileMessage(this.messages[id]);
    }

    if (this.enums[id]) {
      res = this.compileEnum(this.enums[id]);
    }

    if (res) {
      // If used, or at the root level, make a definition
      if (this.root.used[id] || !base) {
        this.root.definitions[id] = res;
        res = this.root.definitions[id];
      }

      // Mark as used if not an Enum
      if (base && key && !this.root.used[id] && !this.enums[id]) {
        this.root.used[id] = {
          base,
          key,
        };
      }

      return res;
    }
  }

  /**
   * Compiles and assigns a type
   */
  private build(
    type: string,
    from: string,
    base: SpecTypesV2.AsyncAPISchemaDefinition | undefined,
    key: string | undefined
  ): void {
    const res = this.resolve(type, from, base, key);
    if (base && key) {
      base[key] = res;
    }
  }

  /**
   * Compiles a protobuf enum to JSON schema
   */
  private compileEnum(
    enumType: InternalEnum
  ): SpecTypesV2.AsyncAPISchemaDefinition {
    const enumMapping: {[key: string]: number} = {};
    for (const enumKey of Object.keys(enumType.values)) {
      enumMapping[enumKey] = enumType.values[enumKey].value;
    }
    
    return {
      title: enumType.name,
      type: 'string',
      enum: Object.keys(enumType.values),
      'x-enum-mapping': enumMapping
    };
  }

  /**
   * Compiles a protobuf message to JSON schema
   */
  private compileMessage(
    message: InternalMessage
  ): SpecTypesV2.AsyncAPISchemaDefinition {
    const res: SpecTypesV2.AsyncAPISchemaDefinition = {
      title: message.name,
      type: 'object',
      properties: {},
      required: [],
      tags: {},
    };

    const that = this;

    message.fields.forEach((field) => {
      if (field.map) {
        if (field.map.from !== 'string') {
          throw new Error(
            `Can only use strings as map keys at ${message.id} ${field.name}`
          );
        }

        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        const f = (res.properties![field.name] = {
          type: 'object',
          additionalProperties: false,
        });

        that.build(field.map.to, message.id, f, 'additionalProperties');
      } else if (field.repeated) {
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        const f = (res.properties![field.name] = {
          type: 'array',
          items: [],
        });

        that.build(field.type, message.id, f, 'items');
      } else {
        that.build(field.type, message.id, res.properties, field.name);
      }

      if (field.required) {
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        res.required!.push(field.name);
      }

      if (field.tag) {
        res.tags[field.name] = field.tag;
      }
    }, this);

    return res;
  }

  private findMessagesNotUsedInOthers(): string[] {
    const complexTypes = [];
    for (const message of this.schema.messages) {
      complexTypes.push(message.id);
    }

    const messagesUsedInOtherMessages = [];
    for (const message of this.schema.messages) {
      for (const field of message.fields) {
        for (const typePath of this.possibleIds(field.type, message.id)) {
          if (
            complexTypes.indexOf(typePath) !== -1 && // Is complex type and not a sub message
            typePath !== message.id // filter recursions with own type
          ) {
            messagesUsedInOtherMessages.push(typePath);
          }
        }
      }
    }

    const messagesNotUsedInOtherMessages = [];
    for (const message of this.schema.messages) {
      if (messagesUsedInOtherMessages.indexOf(message.id) === -1) {
        messagesNotUsedInOtherMessages.push(message.id);
      }
    }

    return messagesNotUsedInOtherMessages;
  }
}

export interface Proto2JsonSchemaOptions {
  getOne?: boolean; // return just the single root object. Throws error if there are more than one root object. Will return only this items. insted of a list of items.
  forceInline?: boolean; // force inlining, even if sub model is used multiple times.
  model?: string; // Get a model from a single object.
}

export function protoj2jsonSchema(protoSchema: Schema, options: Proto2JsonSchemaOptions): AsyncApiTypeMap | SpecTypesV2.AsyncAPISchemaObject {
  const compiler = new Proto2JsonSchema(protoSchema, options);
  return compiler.compile();
}