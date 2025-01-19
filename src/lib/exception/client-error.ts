export class ClientError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public name: string = "ClientError",
    public data?: unknown
  ) {
    super(message);
    this.name = name;
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;

    Object.setPrototypeOf(this, ClientError.prototype);
  }
}
