const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs');
const path = require('path');
const protoParser = require('..');
const parser = require('@asyncapi/parser');

chai.use(chaiAsPromised);
const expect = chai.expect;

parser.registerSchemaParser(protoParser);

function stripAsyncApiTags(json) {
  return json.replace(/^.*x\-parser\-.*$/gm, '');
}

describe('parse()', function () {
  it('should parse proto2 data types', async function () {
    const result = await parser.parse(fs.readFileSync(path.resolve(__dirname, './simple.proto2.yaml'), 'utf8'), { path: __filename });

    await expect(stripAsyncApiTags(JSON.stringify(result.json(), null, 2))).to.equal(
      stripAsyncApiTags(fs.readFileSync(path.resolve(__dirname, './simple.proto2.result.json'), 'utf8'))
    );
  });

  it('should parse proto3 data types', async function () {
    const result = await parser.parse(fs.readFileSync(path.resolve(__dirname, './simple.proto3.yaml'), 'utf8'), { path: __filename });

    await expect(stripAsyncApiTags(JSON.stringify(result.json(), null, 2))).to.equal(
      stripAsyncApiTags(fs.readFileSync(path.resolve(__dirname, './simple.proto3.result.json'), 'utf8'))
    );
  });

  it('should parse proto data types including comments', async function () {
    const result = await parser.parse(fs.readFileSync(path.resolve(__dirname, './comments.proto.yaml'), 'utf8'), { path: __filename });

    await expect(stripAsyncApiTags(JSON.stringify(result.json(), null, 2))).to.equal(
      stripAsyncApiTags(fs.readFileSync(path.resolve(__dirname, './comments.proto.result.json'), 'utf8'))
    );
  });

  it('should parse realworld train_run proto data types', async function () {
    const result = await parser.parse(fs.readFileSync(path.resolve(__dirname, './realworld.train_run.yaml'), 'utf8'), { path: __filename });

    await expect(stripAsyncApiTags(JSON.stringify(result.json(), null, 2))).to.equal(
      stripAsyncApiTags(fs.readFileSync(path.resolve(__dirname, './realworld.train_run.proto.result.json'), 'utf8'))
    );
  });
});