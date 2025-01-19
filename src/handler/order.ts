import { Request, Response } from "express";
import { ResponseError, ResponseSuccess } from "../utils/response";
import { pg } from "../lib/pg-connection";
import { OrderRepository } from "../repository/order";
import { OrderService } from "../service/order";
import { PromotionRepository } from "../repository/promotion";

const orderRepository = new OrderRepository();
const promotionRepository = new PromotionRepository();
const orderService = new OrderService({
  orderRepository,
  promotionRepository,
  db: pg,
});

export const createOrder = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const result = await orderService.createOrder(req.body);
    return ResponseSuccess(res, {
      data: result,
      message: "Success create order",
    });
  } catch (err: any) {
    return ResponseError(res, {
      statusCode: err.statusCode,
      message: err.message,
    });
  }
};
