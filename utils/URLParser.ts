export default class URLParser {
  static getInputValueByName(html: string, name: string): string | null {
    const inputRegex = new RegExp(`<input[^>]+name=['"]${name}['"][^>]*>`, 'i');
    const match = html.match(inputRegex);
    if (!match) {
      return null;
    }

    const valueRegex = /value=['"]([^'"]*)['"]/i;
    const valueMatch = match[0].match(valueRegex);
    return valueMatch ? valueMatch[1] : null;
  }
}
