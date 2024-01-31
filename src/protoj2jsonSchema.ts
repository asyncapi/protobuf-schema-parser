import * as protobuf from 'protobufjs';
import type {AsyncAPISchema} from '@asyncapi/parser/esm/types';
import {googleProtoTypes} from './google-types';
import {Path} from './pathUtils';
import type {v3} from '@asyncapi/parser/esm/spec-types';
import {PrimitiveTypes} from './primitive-types';
import {AsyncAPISchemaDefinition} from '@asyncapi/parser/esm/spec-types/v3';

const ROOT_FILENAME = 'root';
const COMMENT_ROOT_NODE = '@RootNode';
const COMMENT_EXAMPLE = '@Example';
const COMMENT_DEFAULT = '@Default';

class Proto2JsonSchema {
  private root = new protobuf.Root();
  private protoParseOptions = {
    keepCase: true,
    alternateCommentMode: true
  };

  constructor(rawSchema: string) {
    this.process(ROOT_FILENAME, rawSchema);
  }

  private process(filename: string, source: string | ProtoAsJson) {
    if (!isString(source)) {
      const srcObject = source as ProtoAsJson;
      this.root.setOptions(srcObject.options);
      this.root.addJSON(srcObject.nested);
    } else {
      const srcStr = source as string;
      (protobuf.parse as any).filename = filename;
      const parsed = protobuf.parse(srcStr, this.root, this.protoParseOptions);
      let i = 0;
      if (parsed.imports) {
        for (; i < parsed.imports.length; ++i) {
          this.fetch(parsed.imports[i], filename, false);
        }
      }

      if (parsed.weakImports) {
        for (i = 0; i < parsed.weakImports.length; ++i) {
          this.fetch(parsed.weakImports[i], filename, true);
        }
      }
    }
  }

  // Bundled definition existence checking
  private getBundledFileName(filename: string): string | null {
    let idx = filename.lastIndexOf('google/protobuf/');
    if (idx > -1) {
      const shortName = filename.substring(idx);
      if (shortName in protobuf.common) {
        return shortName;
      }
    }

    idx = filename.lastIndexOf('google/type/');
    if (idx > -1) {
      const shortName = filename.substring(idx);
      if (shortName in googleProtoTypes) {
        return shortName;
      }
    }

    return null;
  }

  private fetch(filename: string, parentFilename: string, weak: boolean) {
    filename = this.getBundledFileName(filename) || filename;

    // Skip if already loaded / attempted
    if (this.root.files.indexOf(filename) > -1) {
      return;
    }
    this.root.files.push(filename);

    // Shortcut bundled definitions
    if (filename in protobuf.common) {
      // @ts-ignore
      this.process(filename, protobuf.common[filename] as ProtoAsJson);
      return;
    }

    if (filename in googleProtoTypes) {
      this.process(filename, googleProtoTypes[filename] as ProtoAsJson);
      return;
    }

    filename = Path.resolve(filename, parentFilename);

    if (!weak) {
      throw new Error('Imports are currently not implemented');
    }
    /*
    // Otherwise fetch from disk or network
    let source: string;
    try {
      source = util.fs.readFileSync(filename).toString('utf8');
    } catch (err) {
      if (!weak) {
        throw err;
      }

      return;
    }
    this.process(filename, source);
    */
  }

  public compile(): AsyncAPISchema {
    this.root.resolveAll();

    const rootItemCandidates = this.resolveByFilename(ROOT_FILENAME, this.root.nested as ProtoItems);
    const rootItem = this.findRootItem(rootItemCandidates);

    return this.compileMessage(rootItem);
  }

  private resolveByFilename(filename: string, items: ProtoItems) {
    const hits: protobuf.Type[] = [];
    for (const itemName in items) {
      const item = items[itemName] as any;
      if (item.filename === filename && item instanceof protobuf.Type) {
        hits.push(item);
      }

      if (item.nested) {
        hits.push(...this.resolveByFilename(filename, item.nested));
      }
    }

    return hits;
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  private findRootItem(candidates: protobuf.Type[]): protobuf.Type {
    const usedTypes = new Map<string, Set<string>>();
    for (const candidate of candidates) {
      for (const fieldName in candidate.fields) {
        if (!usedTypes.has(candidate.fields[fieldName].type)) {
          usedTypes.set(
            candidate.fields[fieldName].type,
            new Set<string>([candidate.name])
          );
        } else {
          usedTypes.get(candidate.fields[fieldName].type)?.add(candidate.name);
        }
      }
    }

    const rootTypes: protobuf.Type[] = [];
    for (const candidate of candidates) {
      const isUsedBy = usedTypes.get(candidate.name);
      if (isUsedBy && (isUsedBy?.size > 1 || !isUsedBy.has(candidate.name))) {
        // This type was used in another type. And not only by itself.
        continue;
      }

      rootTypes.push(candidate);
    }

    if (rootTypes.length < 1) {
      throw new Error('Not found a root proto messages');
    }

    if (rootTypes.length === 1) {
      return rootTypes[0];
    }

    for (const rootType of rootTypes) {
      if (rootType.comment && rootType.comment.indexOf(COMMENT_ROOT_NODE) !== -1) {
        return rootType;
      }
    }

    const allRootTypes = rootTypes
      .map(rootType => rootType.name)
      .join(', ');

    throw new Error(`Found more than one root proto messages: ${allRootTypes}`);
  }

  /**
   * Compiles a protobuf message to JSON schema
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  private compileMessage(item: protobuf.Type): AsyncAPISchemaDefinition {
    const obj: v3.AsyncAPISchemaDefinition = {
      title: item.name,
      type: 'object',
      required: [],
      properties: {},
    };

    for (const fieldName in item.fields) {
      const field = item.fields[fieldName];
      if (field.required) {
        obj.required?.push(fieldName);
      }

      if (field.repeated) {
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        obj.properties![field.name] = {
          description: this.extractDescription(field.comment) || '',
          type: 'array',
          items: this.compileField(field, item),
        };

        if (field.comment) {
          const minItemsPattern = /@maxItems\\s(\\d+?)/i;
          const maxItemsPattern = /@maxItems\\s(\\d+?)/i;
          let m: RegExpExecArray | null;
          if ((m = minItemsPattern.exec(field.comment)) !== null) {
            obj.minItems = parseFloat(m[1]);
          }
          if ((m = maxItemsPattern.exec(field.comment)) !== null) {
            obj.maxItems = parseFloat(m[1]);
          }
        }
      } else {
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        obj.properties![field.name] = this.compileField(field, item);
      }
    }

    // @ts-ignore
    if (obj.required?.length < 1) {
      delete obj.required;
    }

    return obj;
  }

  /**
   * Compiles a protobuf enum to JSON schema
   */
  private compileEnum(field: protobuf.Enum): v3.AsyncAPISchemaDefinition {
    const enumMapping: { [key: string]: number } = {};
    for (const enumKey of Object.keys(field.values)) {
      enumMapping[enumKey] = field.values[enumKey];
    }

    const obj: v3.AsyncAPISchemaDefinition = {
      title: field.name,
      type: 'string',
      enum: Object.keys(field.values),
      'x-enum-mapping': enumMapping
    };

    this.addDefaultFromCommentAnnotations(obj, field.comment);

    return obj;
  }

  private compileField(field: protobuf.Field, parentItem: protobuf.Type): v3.AsyncAPISchemaDefinition {
    let obj: v3.AsyncAPISchemaDefinition = {};

    if (PrimitiveTypes.PRIMITIVE_TYPES[field.type.toLowerCase()]) {
      obj = Object.assign(obj, PrimitiveTypes.PRIMITIVE_TYPES[field.type.toLowerCase()]);
      obj['x-primitive'] = field.type;
    } else {
      const item = parentItem.lookupTypeOrEnum(field.type);
      if (!item) {
        throw new Error(`Unable to resolve type "${field.type}" @ ${parentItem.fullName}`);
      }

      // noinspection SuspiciousTypeOfGuard
      if (item instanceof protobuf.Enum) {
        obj = Object.assign(obj, this.compileEnum(item));
      } else {
        obj = Object.assign(obj, this.compileMessage(item));
      }
    }

    this.addValidatorFromCommentAnnotations(obj, field.comment);
    this.addDefaultFromCommentAnnotations(obj, field.comment);

    const desc = this.extractDescription(field.comment);
    if (desc !== null) {
      obj.description = desc;
    }

    const examples = this.extractExamples(field.comment);
    if (examples !== null) {
      obj.examples = examples;
    }

    return obj;
  }

  private extractDescription(comment: string | null): string | null {
    if (!comment || comment?.length < 1) {
      return null;
    }

    comment = comment
      .replace(new RegExp(`\\s{0,15}${COMMENT_EXAMPLE}\\s{0,15}(.+)`, 'ig'), '')
      .replace(new RegExp(`\\s{0,15}${COMMENT_DEFAULT}\\s{0,15}(.+)`, 'ig'), '')
      .replace(new RegExp(`\\s{0,15}${COMMENT_ROOT_NODE}`, 'ig'), '')
      .replace(new RegExp('\\s{0,15}@(Min|Max|Pattern|Minimum|Maximum|ExclusiveMinimum|ExclusiveMaximum|MultipleOf|MaxLength|MinLength|MaxItems|MinItems)\\s{0,15}[\\d.]{1,20}', 'ig'), '')
      .trim();

    if (comment.length < 1) {
      return null;
    }

    return comment;
  }

  private extractExamples(comment: string | null): (string|ProtoAsJson)[] | null {
    if (!comment) {
      return null;
    }

    const examples: (string|ProtoAsJson)[] = [];

    let m: RegExpExecArray | null;
    const examplePattern = new RegExp(`\\s*${COMMENT_EXAMPLE}\\s(.+)$`, 'i');
    for (const line of comment.split('\n')) {
      if ((m = examplePattern.exec(line)) !== null) {
        // The result can be accessed through the `m`-variable.
        examples.push(tryParseToObject(m[1].trim()));
      }
    }

    if (examples.length < 1) {
      return null;
    }

    return examples;
  }

  /* eslint-disable security/detect-unsafe-regex */
  private addValidatorFromCommentAnnotations(obj: AsyncAPISchemaDefinition, comment: string | null) {
    if (comment === null || comment?.length < 1) {
      return;
    }

    const patternMin = /@Min\s([+-]?\d+(\.\d+)?)/i;
    const patternMax = /@Max\s([+-]?\d+(\.\d+)?)/i;
    const patternPattern = /@Pattern\\s([^\n]+)/i;

    const patterns = new Map<string, RegExp>([
      ['minimum', /@Minimum\\s([+-]?\\d+(\\.\\d+)?)/i],
      ['maximum', /@Maximum\\s([+-]?\\d+(\\.\\d+)?)/i],
      ['exclusiveMinimum', /@ExclusiveMinimum\\s(\\d+(\\.\\d+)?)/i],
      ['exclusiveMaximum', /@ExclusiveMaximum\\s(\\d+(\\.\\d+)?)/i],
      ['multipleOf', /@MultipleOf\\s(\\d+(\\.\\d+)?)/i],
      ['maxLength', /@MultipleOf\\s(\\d+(\\.\\d+)?)/i],
      ['minLength', /@MultipleOf\\s(\\d+(\\.\\d+)?)/i],
    ]);

    let m: RegExpExecArray | null;

    if ((m = patternMin.exec(comment)) !== null) {
      obj.minimum = parseFloat(m[1]);
    }

    if ((m = patternMax.exec(comment)) !== null) {
      obj.maximum = parseFloat(m[1]);
    }

    if ((m = patternPattern.exec(comment)) !== null) {
      obj.pattern = m[1];
    }

    for (const e of patterns.entries()) {
      if ((m = e[1].exec(comment)) !== null) {
        obj[e[0]] = parseFloat(m[1]);
      }
    }
  }
  /* eslint-enable security/detect-unsafe-regex */

  private addDefaultFromCommentAnnotations(obj: AsyncAPISchemaDefinition, comment: string | null) {
    if (comment === null || comment?.length < 1) {
      return;
    }
    const defaultPattern = new RegExp(`\\s*${COMMENT_DEFAULT}\\s(.+)$`, 'i');
    let m: RegExpExecArray | null;

    if ((m = defaultPattern.exec(comment)) !== null) {
      obj.default = tryParseToObject(m[1]);
    }
  }
}

export function proto2jsonSchema(rawSchema: string): AsyncAPISchema {
  const compiler = new Proto2JsonSchema(rawSchema);
  return compiler.compile();
}

function isString(value: any): boolean {
  return typeof value === 'string' || value instanceof String;
}

function tryParseToObject(value: string): string | ProtoAsJson {
  if (value.charAt(0) === '{') {
    try {
      const json = JSON.parse(value);
      if (json) {
        return  json;
      }
    } catch (_) {
      // Ignored error, seams not to be a valid json. Maybe just an example starting with an { but is not a json.
    }
  }

  return value;
}

type ProtoAsJson = { [k: string]: any };
type ProtoItems = { [k: string]: protobuf.ReflectionObject };
