import { Request, Response } from "express";
import { UserRepository } from "../repository/user";
import { AuthService } from "../service/auth";
import { ResponseError, ResponseSuccess } from "../utils/response";

const userRepository = new UserRepository();
const authService = new AuthService({ userRepository });

export const createAccount = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const result = await authService.createAccount(req.body);
    return ResponseSuccess(res, {
      data: result,
      message: "Success create account",
    });
  } catch (err: any) {
    return ResponseError(res, {
      statusCode: err.statusCode,
      message: err.message,
    });
  }
};
