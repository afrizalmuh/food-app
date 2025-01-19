import { IDatabase } from "pg-promise";
import {
  IFilterPromotion,
  IGetPromotion,
  IGetPromotionItem,
  IPromotion,
} from "../interfaces/promotion";
import { PromotionRepository } from "../repository/promotion";
import { IClient } from "pg-promise/typescript/pg-subset";
import {
  appendNewKey,
  calculateDiscount,
  calculateItemRewards,
} from "../lib/helper";
import { IQueryParams } from "../interfaces/http";

interface PromotionServiceDepedencies {
  promotionRepository: PromotionRepository;
  db: IDatabase<object, IClient>;
}

export class PromotionService {
  private promotionRepository: PromotionRepository;
  private db: IDatabase<object, IClient>;

  constructor({ promotionRepository, db }: PromotionServiceDepedencies) {
    this.promotionRepository = promotionRepository;
    this.db = db;
  }
  async createAndUpdatePromotion(payload: IPromotion) {
    try {
      const isUpdate = payload.promotion_id;
      let promoHeader;
      await this.db.tx(async (tx) => {
        const insertPromotionHeader =
          await this.promotionRepository.createPromotion(payload, tx);

        promoHeader = {
          promotion_id: insertPromotionHeader.promotion_id,
        };

        if (isUpdate) {
          await this.promotionRepository.updatePromotionHeader(isUpdate, tx);
        }

        if (payload.promotion_customer.length > 0) {
          await this.promotionRepository.createPromotionCustomer(
            appendNewKey(payload.promotion_customer, promoHeader),
            tx
          );
        }

        if (payload.promotion_menu_rules.length > 0) {
          await this.promotionRepository.createPromotionRules(
            appendNewKey(payload.promotion_menu_rules, promoHeader),
            tx
          );
        }

        if (payload.promotion_rewards) {
          const insertPromotionRewards =
            await this.promotionRepository.createPromotionRewards(
              appendNewKey(payload.promotion_rewards, promoHeader),
              tx
            );

          if (
            payload.promotion_reward_menu.length > 0 &&
            insertPromotionRewards
          ) {
            await this.promotionRepository.createPromotionRewardMenu(
              appendNewKey(
                payload.promotion_reward_menu,
                insertPromotionRewards
              ),
              tx
            );
          }
        }
      });
      return promoHeader;
    } catch (error) {
      throw error;
    }
  }

  async list(args: IQueryParams) {
    const promotionList = await this.promotionRepository.listPromotion(args);

    return promotionList;
  }

  async getPromotion(payload: IGetPromotion) {
    const promotionList = await this.promotionRepository.getPromotionItem(
      payload
    );

    if (promotionList.length === 0) return [];

    const processPromotion = this.processPromotion(
      promotionList,
      payload.items,
      payload.grand_total
    );

    if (processPromotion.length === 0) return [];

    const rewardPromotion = await this.getPromotionReward(
      processPromotion,
      payload.grand_total
    );

    return rewardPromotion;
  }

  processPromotion(
    promotionList: IFilterPromotion[],
    payloadItemList: IGetPromotionItem[],
    grandTotal: number
  ): IFilterPromotion[] {
    const processedPromotions: IFilterPromotion[] = [];

    promotionList.forEach((promotion) => {
      // Skip promotions that don't meet the minimum spending requirement
      if (
        promotion.minimum_spending &&
        grandTotal < promotion.minimum_spending
      ) {
        return;
      }
      // Process promotions with menu rules
      const hasValidMenuRules =
        promotion.promotion_menu_rules &&
        promotion.promotion_menu_rules.some((rule) =>
          payloadItemList.some(
            (item) =>
              rule.target_id === item.menu_id && item.qty >= rule.quantity
          )
        );

      if (hasValidMenuRules || !promotion.promotion_menu_rules) {
        processedPromotions.push(promotion);
      }
    });

    return processedPromotions;
  }

  async getPromotionReward(
    promotionIds: IFilterPromotion[],
    grandTotal: number
  ) {
    let afterDiscount: number = grandTotal;

    const rewardPromotion = await this.promotionRepository.getPromotionReward(
      promotionIds
    );

    // Calculate the total discount
    afterDiscount = calculateDiscount(rewardPromotion, afterDiscount);

    // Process and group item rewards
    const totalDiscountFreeMenu = calculateItemRewards(rewardPromotion);

    return {
      detail_promotion: rewardPromotion,
      grand_total_after_discount: afterDiscount,
      total_discount_amount: grandTotal - afterDiscount,
      total_discount_free_menu: totalDiscountFreeMenu,
    };
  }
}
