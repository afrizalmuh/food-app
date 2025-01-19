import { Response } from "express";
import { IResponse } from "../interfaces/response";

export function ResponseSuccess<TData = any>(
  res: Response,
  {
    data,
    token,
    message = "Success",
    statusCode = 200,
  }: { data?: TData; token?: string; message?: string; statusCode?: number }
) {
  const response: IResponse = {
    success: true,
    token,
    statusCode,
    message,
    data,
  };

  return res.status(statusCode).send(response);
}

export function ResponseError(
  res: Response,
  {
    message = "Something went wrong",
    statusCode = 500,
  }: { message?: string; statusCode?: number }
) {
  const response: IResponse = {
    success: false,
    statusCode,
    message: message,
  };
  return res.status(statusCode).send(response);
}
