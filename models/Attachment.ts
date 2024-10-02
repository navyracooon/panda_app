export default class Attachment {
  constructor(
    public name: string,
    public ref: string,
    public size: number,
    public type: string,
    public url: string,
  ) {}
}
