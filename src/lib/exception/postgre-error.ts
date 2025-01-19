export class PostgreError extends Error {
  constructor(
    public message: string,
    public code: string,
    public name: string = "PostgreError",
    public stack?: string
  ) {
    super(message);
    this.name = name;
    this.message = message;
    this.name = name;
    this.stack = stack;

    Object.setPrototypeOf(this, PostgreError.prototype);
  }
}
