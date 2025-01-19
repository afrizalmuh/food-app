import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../constant/config";
import { ResponseError } from "../utils/response";
import { IRewardPromotion } from "../interfaces/promotion";

export const hashing = async (password: string): Promise<any> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const verifyPassword = async (
  plainPassword: string,
  hashPassword: string
): Promise<boolean | string> => {
  const verified: boolean = bcrypt.compareSync(plainPassword, hashPassword);
  if (!verified) {
    throw { statusCode: 400, message: "Wrong password" };
  }
  return verified;
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const headers = req.headers.authorization;
    if (!headers) throw { statusCode: 401, message: "Unauthorized" };
    jwt.verify(
      headers.split(" ")[1],
      config.SECRET_KEY as string,
      async (err) => {
        if (err) {
          var err_type_name = "TokenExpiredError";
          if (err?.name.toLocaleLowerCase() === err_type_name.toLowerCase())
            return ResponseError(res, {
              statusCode: 401,
              message: "Token Expired",
            });
          else
            return ResponseError(res, {
              statusCode: 401,
              message: "Unauthorized",
            });
        }
        next();
      }
    );
  } catch (err: any) {}
};

export const validateArray = (arrData: []) =>
  arrData && Array.isArray(arrData) && arrData.length;

export const appendNewKey = (data: any, newKeyValue: any) => {
  if (Array.isArray(data)) {
    return data.map((d) => {
      d = { ...d, ...newKeyValue };
      return d;
    });
  }

  return { ...data, ...newKeyValue };
};

export const calculateDiscount = (
  rewardPromotion: IRewardPromotion[],
  afterDiscount: number
): number => {
  rewardPromotion.forEach((promotion: any) => {
    if (promotion.discount_reward) {
      promotion.discount_reward.forEach((reward: any) => {
        if (reward.discount_type === "percentage") {
          const discountPromotion =
            (afterDiscount * reward.discount_amount) / 100;
          if (
            reward.max_discount_amount > 0 &&
            discountPromotion >= reward.max_discount_amount
          ) {
            afterDiscount -= reward.max_discount_amount;
          } else {
            afterDiscount -= discountPromotion;
          }
        } else {
          if (
            reward.max_discount_amount > 0 &&
            reward.discount_amount >= reward.max_discount_amount
          ) {
            afterDiscount -= reward.max_discount_amount;
          } else {
            afterDiscount -= reward.discount_amount;
          }
        }
      });
    }
  });
  return afterDiscount;
};

export const calculateItemRewards = (
  rewardPromotion: IRewardPromotion[]
): IRewardPromotion[] => {
  const combinedItemRewards = rewardPromotion.reduce(
    (allItems: any[], promotion: any) => {
      if (promotion.item_reward) {
        return allItems.concat(promotion.item_reward);
      }
      return allItems;
    },
    []
  );

  const totalPrice = combinedItemRewards.reduce((sum, item) => {
    return sum + item.sell_price * item.total_quantity;
  }, 0);

  return totalPrice;
};
