import { Request, Response } from "express";
import { ResponseError, ResponseSuccess } from "../utils/response";
import { MenuRepository } from "../repository/menu";
import { MenuService } from "../service/menu";
import { AreaRepository } from "../repository/area";
import { AreaService } from "../service/area";

const areaRepository = new AreaRepository();
const areaService = new AreaService({ areaRepository });

export const createArea = async (req: Request, res: Response): Promise<any> => {
  try {
    const result = await areaService.createArea(req.body);
    return ResponseSuccess(res, {
      data: result,
      message: "Success create area",
    });
  } catch (err: any) {
    return ResponseError(res, {
      statusCode: err.statusCode,
      message: err.message,
    });
  }
};
