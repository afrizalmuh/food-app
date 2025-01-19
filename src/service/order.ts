import { IDatabase } from "pg-promise";
import {
  IGetPromotion,
  IPromotion,
  IPromotionUsage,
  IValidatePromotionList,
} from "../interfaces/promotion";
import { PromotionRepository } from "../repository/promotion";
import { IClient } from "pg-promise/typescript/pg-subset";
import { appendNewKey } from "../lib/helper";
import { IOrder } from "../interfaces/order";
import { OrderRepository } from "../repository/order";
import { ALL_CUSTOMER } from "../constant";

interface OrderServiceDepedencies {
  orderRepository: OrderRepository;
  promotionRepository: PromotionRepository;
  db: IDatabase<object, IClient>;
}

export class OrderService {
  private orderRepository: OrderRepository;
  private promotionRepository: PromotionRepository;
  private db: IDatabase<object, IClient>;

  constructor({
    orderRepository,
    promotionRepository,
    db,
  }: OrderServiceDepedencies) {
    this.orderRepository = orderRepository;
    this.promotionRepository = promotionRepository;
    this.db = db;
  }
  async createOrder(payload: IOrder) {
    try {
      let orderHeader;

      if (payload.order_menu.length === 0)
        throw { statusCode: 400, message: "Order menu cant be empty" };

      await this.db.tx(async (tx) => {
        const insertOrderHeader = await this.orderRepository.createOrder(
          { ...payload, customer_id: payload.customer.customer_id },
          tx
        );

        orderHeader = {
          order_id: insertOrderHeader.order_id,
        };

        await this.orderRepository.createOrderDetail(
          appendNewKey(payload.order_menu, orderHeader),
          tx
        );

        if (payload.promotion && payload.promotion.length > 0) {
          const mappingItems = payload.order_menu.map((item) => ({
            menu_id: item.menu_id,
            qty: item.quantity,
            amount: item.sell_price,
          }));

          const promotionIds: IValidatePromotionList[] = payload.promotion
            .filter((item) => item.promotion_id !== undefined)
            .map((item) => ({
              promotion_id: item.promotion_id as number,
            }));

          const payloadValidatePromotion: IGetPromotion = {
            current_date: payload.current_date,
            customer: payload.customer,
            items: mappingItems,
            grand_total: payload.subtotal,
            promotions: promotionIds,
          };

          const validatePromotion =
            await this.promotionRepository.checkPromotion(
              payloadValidatePromotion
            );

          if (validatePromotion.length !== payload.promotion.length)
            throw { statusCode: 400, message: "Quota promotion has expired" };

          for (const promotion of payload.promotion) {
            const payloadUsage: IPromotionUsage = {
              ...orderHeader,
              promotion_id: promotion.promotion_id,
              contact_id: payload.customer.customer_id || ALL_CUSTOMER,
              total_discount: promotion.total_discount,
            };

            const usagePromotion =
              await this.promotionRepository.usagePromotion(payloadUsage, tx);

            if (promotion.items && promotion.items.length > 0) {
              await this.promotionRepository.bulkItemPromotion(
                appendNewKey(promotion.items, usagePromotion),
                tx
              );
            }
          }
        }
      });
      return orderHeader;
    } catch (error) {
      throw error;
    }
  }
}
