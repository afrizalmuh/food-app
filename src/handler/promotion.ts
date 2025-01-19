import { Request, Response } from "express";
import { ResponseError, ResponseSuccess } from "../utils/response";
import { PromotionRepository } from "../repository/promotion";
import { PromotionService } from "../service/promotion";
import { pg } from "../lib/pg-connection";

const promotionRepository = new PromotionRepository();
const promotionService = new PromotionService({ promotionRepository, db: pg });

export const createAndUpdatePromotion = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const result = await promotionService.createAndUpdatePromotion(req.body);
    return ResponseSuccess(res, {
      data: result,
      message: "Success create promotion",
    });
  } catch (err: any) {
    return ResponseError(res, {
      statusCode: err.statusCode,
      message: err.message,
    });
  }
};

export const getPromotion = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const result = await promotionService.getPromotion(req.body);
    return ResponseSuccess(res, {
      data: result,
      message: "Success get promotion",
    });
  } catch (err: any) {
    return ResponseError(res, {
      statusCode: err.statusCode,
      message: err.message,
    });
  }
};

export const list = async (req: Request, res: Response): Promise<any> => {
  try {
    const result = await promotionService.list(req.query);
    return ResponseSuccess(res, {
      data: result,
      message: "Success get promotion",
    });
  } catch (err: any) {
    return ResponseError(res, {
      statusCode: err.statusCode,
      message: err.message,
    });
  }
};
