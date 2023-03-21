// base on https://raw.githubusercontent.com/vipszx/protobuf-jsonschema/master/index.js

const primitive = require('./primitive-types');
const googleTypes = require('./google-types');

function Compiler(schema, options) {
  this.messages = {};
  this.enums = {};
  this.options = options;
  this.schema = this.convert(schema);
}

const protoBuffImports = [
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

Compiler.prototype.convert = function (schema) {
  this.visit(schema, schema.package || '');

  for (const i of schema.imports) {
    if (protoBuffImports.indexOf(i) !== -1) {
      // Well known types, can be handled.
      continue;
    }

    throw new Error(`Protobuff imports are not supported: ${i}`);
  }

  return schema;
};

/**
 * Visits a schema in the tree, and assigns messages and enums to the lookup tables.
 */
Compiler.prototype.visit = function (schema, prefix) {
  if (schema.enums) {
    schema.enums.forEach(function (e) {
      e.id = prefix + (prefix ? '.' : '') + (e.id || e.name);
      this.enums[e.id] = e;
      this.visit(e, e.id);
    }, this);
  }

  if (schema.messages) {
    schema.messages.forEach(function (m) {
      m.id = prefix + (prefix ? '.' : '') + (m.id || m.name);
      this.messages[m.id] = m;
      this.visit(m, m.id);
    }, this);
  }
};

/**
 * Top level compile method. If a type name is provided,
 * compiles just that type and its dependencies. Otherwise,
 * compiles all types in the file.
 */
Compiler.prototype.compile = function () {
  this.root = {
    definitions: {},
    used: {}
  };

  if (this.options.getOne) {
    // Get the single defined root object
    const messagesNotUsedInOthers = this.findMessagesNotUsedInOthers();
    if (messagesNotUsedInOthers > 1) {
      throw new Error(`Option getOne is set but there are multple proto messages: ${messagesNotUsedInOthers.join(',')}`);
    }

    if (messagesNotUsedInOthers < 1) {
      throw new Error('Option getOne is set but there are no proto messages');
    }

    this.options.model = messagesNotUsedInOthers[0];
  }

  if (this.options.model) {
    this.resolve(this.options.model, '');
  } else {
    this.schema.messages.forEach(function (message) {
      this.resolve(message.id, '');
    }, this);

    this.schema.enums.forEach(function (e) {
      this.resolve(e.id, '');
    }, this);
  }

  if (this.options.model && this.options.forceInline) {
    return this.root.definitions[this.options.model];
  }

  return this.root.definitions;
};

/**
 * Resolves a type name at the given path in the schema tree.
 * Returns a compiled JSON schema.
 */
Compiler.prototype.resolve = function (type, from, base, key) {
  if (primitive[type]) {
    return primitive[type];
  }  
  
  if (googleTypes[type]) {
    return googleTypes[type];
  }

  const lookup = from.split('.');
  for (let i = lookup.length; i >= 0; i--) {
    const id = lookup.slice(0, i).concat(type).join('.');

    const res = this.resolveLevel(id, base, key);
    if (res) {
      return res;
    }
  }

  throw new Error(`Could not resolve ${type}`);
};

Compiler.prototype.resolveLevel = function (id, base, key) {
  // If this type was used before, move it from inline to a reusable definition
  if (this.root.used[id] && !this.root.definitions[id] && !this.options.forceInline) {
    const k = this.root.used[id];
    this.root.definitions[id] = k[0][k[1]];
    k[0][k[1]] = this.root.definitions[id];
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
    if (base && !this.root.used[id] && !this.enums[id]) {
      this.root.used[id] = [base, key];
    }

    return res;
  }
};

/**
 * Compiles and assigns a type
 */
Compiler.prototype.build = function (type, from, base, key) {
  const res = this.resolve(type, from, base, key);
  if (base) {
    base[key] = res;
  }
};

/**
 * Compiles a protobuf enum to JSON schema
 */
Compiler.prototype.compileEnum = function (enumType, root) {
  return {
    title: enumType.name,
    type: 'string',
    enum: Object.keys(enumType.values)
  };
};

/**
 * Compiles a protobuf message to JSON schema
 */
Compiler.prototype.compileMessage = function (message, root) {
  const res = {
    title: message.name,
    type: 'object',
    properties: {},
    required: [],
    tags: {},
  };

  message.fields.forEach(function (field) {
    if (field.map) {
      if (field.map.from !== 'string') {
        throw new Error(`Can only use strings as map keys at ${message.id} ${field.name}`);
      }

      const f = res.properties[field.name] = {
        type: 'object',
        additionalProperties: null
      };

      this.build(field.map.to, message.id, f, 'additionalProperties');
    } else if (field.repeated) {
      const f = res.properties[field.name] = {
        type: 'array',
        items: null
      };

      this.build(field.type, message.id, f, 'items');
    } else {
      this.build(field.type, message.id, res.properties, field.name);
    }

    if (field.required) {
      res.required.push(field.name);
    }

    if (field.tag) {
      res.tags[field.name] = field.tag;
    }
  }, this);

  return res;
};

Compiler.prototype.findMessagesNotUsedInOthers = function () {
  const complexTypes = [];
  for (const message of this.schema.messages) {
    complexTypes.push(message.id);
  }

  const messagesUsedInOtherMessages = [];
  for (const message of this.schema.messages) {
    for (const field of message.fields) {
      if (complexTypes.indexOf(field.type) !== -1 // Is complex type and not a sub message
        && field.type !== message.id // filter recursions with own type
      ) {
        messagesUsedInOtherMessages.push(field.type);
      }
    };
  }

  const messagesNotUsedInOtherMessages = [];
  for (const message of this.schema.messages) {
    if (messagesUsedInOtherMessages.indexOf(message.id) === -1) {
      messagesNotUsedInOtherMessages.push(message.id);
    }
  }

  return messagesNotUsedInOtherMessages;
};

module.exports = function (protoStr, options = {}) {
  const _options = Object.assign({
    getOne: false, // return just the single root object. Throws error if there are more than one root object. Will return only this items. insted of a list of items.
    forceInline: false, // force inlining, even if sub model is used multiple times.
    model: undefined, // Get a model from a single object.
  }, options);

  if (_options.getOne) {
    _options.forceInline = true;
  }

  const compiler = new Compiler(protoStr, _options);
  return compiler.compile();
};