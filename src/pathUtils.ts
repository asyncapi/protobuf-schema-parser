export class Path {
  public static isAbsolute(path: string): boolean {
    return (/^(?:\/|\w+:|\\\\\w+)/).test(path);
  }

  public static normalize(path: string): string {
    const firstTwoCharacters = path.substring(0, 2);
    let uncPrefix = '';
    if (firstTwoCharacters === '\\\\') {
      uncPrefix = firstTwoCharacters;
      path = path.substring(2);
    }

    path = path.replace(/\\/g, '/')
      .replace(/\/{2,}/g, '/');
    const parts = path.split('/');
    const absolute = this.isAbsolute(path);
    let prefix = '';
    if (absolute) {
      prefix = `${parts.shift()}/`;
    }

    for (let i = 0; i < parts.length;) {
      if (parts[i] === '..') {
        if (i > 0 && parts[i - 1] !== '..') {
          parts.splice(--i, 2);
        } else if (absolute) {
          parts.splice(i, 1);
        } else {
          ++i;
        }
      } else if (parts[i] === '.') {
        parts.splice(i, 1);
      } else {
        ++i;
      }
    }
    return uncPrefix + prefix + parts.join('/');
  }

  public static resolve(originPath: string, includePath: string, alreadyNormalized = false): string {
    if (!alreadyNormalized) {
      includePath = this.normalize(includePath);
    }

    if (this.isAbsolute(includePath)) {
      return includePath;
    }

    if (!alreadyNormalized) {
      originPath = this.normalize(originPath);
    }

    return (originPath = originPath.replace(/(?:\/|^)[^/]+$/, '')).length ?
      this.normalize(`${originPath}/${includePath}`) :
      includePath;
  }
}
