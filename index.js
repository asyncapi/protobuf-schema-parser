const proto2protoj = require('protocol-buffers-schema');
const protoj2jsonSchema = require('./protoj2jsonSchema');

module.exports = {
  parse,
  getMimeTypes
};

async function parse({ message, defaultSchemaFormat }) {
  try {
    const payload = message.payload;

    const jsonModel = protoj2jsonSchema(
      proto2protoj(payload),
      {
        getOne: true,
      }
    );

    message['x-parser-original-schema-format'] = message.schemaFormat || defaultSchemaFormat;
    message['x-parser-original-payload'] = payload;
    message.payload = jsonModel;
    delete message.schemaFormat;
  } catch (e) {
    console.error(e);
  }
}

function getMimeTypes() {
  return [
    'application/vnd.google.protobuf;version=2',
    'application/vnd.google.protobuf;version=3',
  ];
}
