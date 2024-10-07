export default class URLParser {
  static getInputValueByName(html: string, name: string): string | null {
    const inputRegex = new RegExp(`<input[^>]+name=['"]${name}['"][^>]*>`, "i");
    const match = html.match(inputRegex);
    if (!match) {
      return null;
    }

    const valueRegex = /value=['"]([^'"]*)['"]/i;
    const valueMatch = match[0].match(valueRegex);
    return valueMatch ? valueMatch[1] : null;
  }

  static getScriptContentByPattern(
    html: string,
    pattern: RegExp,
  ): string | null {
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;

    while ((match = scriptRegex.exec(html)) !== null) {
      if (pattern.test(match[1])) {
        return match[1];
      }
    }

    return null;
  }
}
