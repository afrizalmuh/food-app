import { ClientError } from "./client-error";

export class NotFoundError extends ClientError {
  constructor(public message: string, public statusCode: number = 404) {
    super(message, statusCode, "NotFoundError");

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
