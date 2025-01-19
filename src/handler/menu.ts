import { Request, Response } from "express";
import { ResponseError, ResponseSuccess } from "../utils/response";
import { MenuRepository } from "../repository/menu";
import { MenuService } from "../service/menu";

const menuRepository = new MenuRepository();
const menuService = new MenuService({ menuRepository });

export const createMenuCategory = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const result = await menuService.createMenuCategory(req.body);
    return ResponseSuccess(res, {
      data: result,
      message: "Success create menu category",
    });
  } catch (err: any) {
    return ResponseError(res, {
      statusCode: err.statusCode,
      message: err.message,
    });
  }
};

export const createMenu = async (req: Request, res: Response): Promise<any> => {
  try {
    const result = await menuService.createMenu(req.body);
    return ResponseSuccess(res, {
      data: result,
      message: "Success create menu",
    });
  } catch (err: any) {
    return ResponseError(res, {
      statusCode: err.statusCode,
      message: err.message,
    });
  }
};
export const listMenu = async (req: Request, res: Response): Promise<any> => {
  try {
    const result = await menuService.listMenu(req.query);
    return ResponseSuccess(res, {
      data: result,
      message: "Get list menu",
    });
  } catch (err: any) {
    return ResponseError(res, {
      statusCode: err.statusCode,
      message: err.message,
    });
  }
};
