import { ITask } from "pg-promise";
import {
  IGetPromotion,
  IPromotionCustomer,
  IPromotionRewards,
  IPromotionRewardMenu,
  IPromotionRules,
  IRequestPromotion,
  IFilterPromotion,
  IPromotion,
  IPromotionUsage,
  IGetPromotionItem,
} from "../interfaces/promotion";
import { PostgreError } from "../lib/exception";
import { pg, pgp } from "../lib/pg-connection";
import { ALL_CUSTOMER, LOYAL_USER, REWARD_TYPE } from "../constant";
import { appendNewKey } from "../lib/helper";
import { IQueryParams } from "../interfaces/http";
import { getSqlLimitFragment } from "../lib/query";

export class PromotionRepository {
  private DB = pg;

  constructor() {
    this.DB = pg;
  }

  async createPromotionCustomer(
    payload: IPromotionCustomer[],
    dbTx: ITask<object>
  ) {
    try {
      const columnSet = new pgp.helpers.ColumnSet(
        ["promotion_id", "target_id"],
        {
          table: "promotion_customer",
        }
      );
      const query = pgp.helpers.insert(payload, columnSet);
      const result = await dbTx.manyOrNone(query);
      return result;
    } catch (error: any) {
      throw new PostgreError(error.message, error.code);
    }
  }

  async createPromotionRules(payload: IPromotionRules[], dbTx: ITask<object>) {
    try {
      const columnSet = new pgp.helpers.ColumnSet(
        ["target_id", "quantity", "promotion_id"],
        {
          table: "promotion_menu_rules",
        }
      );
      const query =
        pgp.helpers.insert(payload, columnSet) +
        "RETURNING promotion_menu_rule_id";

      const result = await dbTx.manyOrNone(query);
      return result;
    } catch (error: any) {
      throw new PostgreError(error.message, error.code);
    }
  }

  async createPromotionRewards(
    payload: IPromotionRewards,
    dbTx: ITask<object>
  ) {
    try {
      const query = `INSERT INTO promotion_rewards (promotion_id, reward_type, discount_type, discount_amount, max_discount_amount)
        VALUES ($<promotion_id>, $<reward_type>, $<discount_type>, $<discount_amount>, $<max_discount_amount>) RETURNING promotion_reward_id`;
      const result = await dbTx.oneOrNone(query, payload);
      return result;
    } catch (error: any) {
      throw new PostgreError(error.message, error.code);
    }
  }

  async createPromotionRewardMenu(
    payload: IPromotionRewardMenu[],
    dbTx: ITask<object>
  ) {
    try {
      const columnSet = new pgp.helpers.ColumnSet(
        ["promotion_reward_id", "target_id", "quantity"],
        {
          table: "promotion_reward_menu",
        }
      );
      const query =
        pgp.helpers.insert(payload, columnSet) +
        " RETURNING promotion_reward_id";
      const result = await dbTx.manyOrNone(query);
      return result;
    } catch (error: any) {
      throw new PostgreError(error.message, error.code);
    }
  }

  async createPromotion(payload: IRequestPromotion, dbTx: ITask<object>) {
    try {
      const query = `INSERT INTO promotion_header (promotion_name, start_date, end_date, customer_target_type, is_limited, is_expired, quota, minimum_spending, created_by) 
        VALUES ($<promotion_name>, $<start_date>, $<end_date>, $<customer_target_type>, $<is_limited>, $<is_expired>, $<quota>, $<minimum_spending>, $<created_by>) 
        RETURNING promotion_id`;
      const result = await dbTx.oneOrNone(query, payload);
      return result;
    } catch (error: any) {
      throw new PostgreError(error.message, error.code);
    }
  }

  async updatePromotionHeader(promotionId: number, dbTx: ITask<object>) {
    try {
      const query = `
        DELETE FROM promotion_header WHERE promotion_id = $1;
        DELETE FROM promotion_customer WHERE promotion_id = $1;
        DELETE FROM promotion_menu_rules WHERE promotion_id = $1;
        DELETE FROM promotion_rewards WHERE promotion_id = $1;
      `;
      return dbTx.multi(query, [promotionId]);
    } catch (error: any) {
      throw new PostgreError(error.message, error.code);
    }
  }

  async checkPromotion(payload: IGetPromotion) {
    const { promotions } = payload;

    if (promotions && promotions.length === 0) return [];

    const promotionIds = promotions?.map((item) => item.promotion_id);
    const query = `
      SELECT ph.promotion_id, ph.promotion_name, ph.start_date, ph.end_date, ph.quota, 
      ph.minimum_spending, ph.is_expired, ph.is_limited, ph.customer_target_type
      FROM promotion_header ph
      LEFT JOIN promotion_customer pc ON pc.promotion_id = ph.promotion_id
      WHERE ph.promotion_id in ($3:csv) AND
      (
        (
          $1::DATE >= ph.start_date
          AND ph.is_expired IS false
          )
        OR (
          $1::DATE >= ph.start_date
          AND $1::DATE <= ph.end_date
          AND ph.is_expired IS true
          )
        )
        AND COALESCE(ph.minimum_spending, 0) <= $2
        AND (
          ph.is_limited IS false
          OR (
            ph.is_limited IS true
            AND coalesce(ph.quota, 0) > (
              SELECT count(promotion_usage_id)
              FROM promotion_usage pu
              WHERE pu.promotion_id = ph.promotion_id
            )
          )
        )
      `;

    const result = await this.DB.query(query, [
      payload.current_date,
      payload.grand_total,
      promotionIds,
    ]);
    return result;
  }

  async getPromotionItem(payload: IGetPromotion) {
    try {
      const contactId = payload.customer.customer_id;
      const areaId = payload.customer.area_id;
      const query = `
        SELECT ph.promotion_id, ph.promotion_name, ph.start_date, ph.end_date, ph.quota, 
        ph.minimum_spending, ph.is_expired, ph.is_limited, ph.customer_target_type,
        (
          select array_to_json(array_agg(q))
          from (
            select pmr.target_id, pmr.quantity from promotion_menu_rules pmr
            where pmr.promotion_id = ph.promotion_id 
          )q
        ) promotion_menu_rules
        FROM promotion_header ph
        LEFT JOIN promotion_customer pc ON pc.promotion_id = ph.promotion_id
        WHERE 
        (
          (
            $<current_date>::DATE >= ph.start_date
            AND ph.is_expired IS false
            )
          OR (
            $<current_date>::DATE >= ph.start_date
            AND $<current_date>::DATE <= ph.end_date
            AND ph.is_expired IS true
            )
          )
          AND (
            (
            ph.customer_target_type = 'all'
            AND (
              pc.target_id = ${contactId}
              OR pc.target_id = ${ALL_CUSTOMER}
              )
            )
            OR (
              ph.customer_target_type = 'new_user'
              AND (
                SELECT count(co.order_id)
                FROM orders co
                WHERE co.customer_id = ${contactId}
              ) = 0
            )
            OR (
              ph.customer_target_type = 'loyal_user'
              AND (
                SELECT count(co.order_id)
                FROM orders co
                WHERE co.customer_id = ${contactId}
              ) >= ${LOYAL_USER}
            )
            OR (
              ph.customer_target_type = 'specific_city'
              AND pc.target_id = ${areaId}
            )
          )
          AND COALESCE(ph.minimum_spending, 0) <= $<grand_total>
          AND (
            ph.is_limited IS false
            OR (
              ph.is_limited IS true
              AND coalesce(ph.quota, 0) > (
                SELECT count(promotion_usage_id)
                FROM promotion_usage pu
                WHERE pu.promotion_id = ph.promotion_id
              )
            )
          )`;
      const result = await this.DB.query(query, payload);
      return result;
    } catch (error: any) {
      throw new PostgreError(error.message, error.code);
    }
  }

  async listPromotion(args: IQueryParams) {
    try {
      const {
        page = 1,
        pageSize = 25,
        q,
        sortBy = "promotion_name",
        sortDirection = "asc",
      } = args;
      const limitOffset = getSqlLimitFragment(page, pageSize);
      let where = "";
      if (q && q !== "") {
        where = ` AND ph.promotion_name ~* $<q>`;
      }

      if (sortBy) {
        where += ` ORDER BY ${sortBy} ${sortDirection}`;
      }

      const query = `
        SELECT ph.promotion_id, ph.promotion_name, ph.start_date, ph.end_date, ph.quota, 
        ph.minimum_spending, ph.is_expired, ph.is_limited, ph.customer_target_type,
        (
          select array_to_json(array_agg(q))
          from (
            select pmr.target_id, pmr.quantity from promotion_menu_rules pmr
            where pmr.promotion_id = ph.promotion_id 
          )q
        ) promotion_menu_rules,
        (
          select array_to_json(array_agg(q))
          from (
            select pr.reward_type, pr.discount_type, pr.discount_amount, pr.max_discount_amount from promotion_rewards pr
            where pr.promotion_id = ph.promotion_id and pr.reward_type = '${REWARD_TYPE.DISCOUNT}'
          )q
        ) discount_reward,
         (
          SELECT array_to_json(array_agg(q))
          FROM (
            SELECT 
              prm.target_id, 
              SUM(prm.quantity) AS total_quantity,
              m.menu_name, 
              m.sell_price
            FROM promotion_rewards pr
            LEFT JOIN promotion_reward_menu prm 
              ON prm.promotion_reward_id = pr.promotion_reward_id
            LEFT JOIN menu m 
              ON prm.target_id = m.menu_id
            WHERE pr.promotion_id = ph.promotion_id 
              AND pr.reward_type = '${REWARD_TYPE.ITEMS}'
            GROUP BY prm.target_id, m.menu_name, m.sell_price
          ) q
        ) item_reward
        FROM promotion_header ph
        LEFT JOIN promotion_customer pc ON pc.promotion_id = ph.promotion_id
        ${where}
        ${limitOffset}
        `;

      const result = await this.DB.query(query);
      return result;
    } catch (error: any) {
      throw new PostgreError(error.message, error.code);
    }
  }

  async getPromotionReward(promotionIds: IFilterPromotion[]) {
    try {
      const promtoionIds = promotionIds.map((item) => item.promotion_id);
      const query = `
        SELECT ph.promotion_id, ph.promotion_name, ph.start_date, ph.end_date, ph.quota, 
        ph.minimum_spending, ph.is_expired, ph.is_limited, ph.customer_target_type,
        (
          select array_to_json(array_agg(q))
          from (
            select pr.reward_type, pr.discount_type, pr.discount_amount, pr.max_discount_amount from promotion_rewards pr
            where pr.promotion_id = ph.promotion_id and pr.reward_type = '${REWARD_TYPE.DISCOUNT}'
          )q
        ) discount_reward,
         (
          SELECT array_to_json(array_agg(q))
          FROM (
            SELECT 
              prm.target_id, 
              SUM(prm.quantity) AS total_quantity,
              m.menu_name, 
              m.sell_price
            FROM promotion_rewards pr
            LEFT JOIN promotion_reward_menu prm 
              ON prm.promotion_reward_id = pr.promotion_reward_id
            LEFT JOIN menu m 
              ON prm.target_id = m.menu_id
            WHERE pr.promotion_id = ph.promotion_id 
              AND pr.reward_type = '${REWARD_TYPE.ITEMS}'
            GROUP BY prm.target_id, m.menu_name, m.sell_price
          ) q
        ) item_reward
        FROM promotion_header ph
        where ph.promotion_id in ($1:csv)
      `;
      return await this.DB.query(query, [promtoionIds]);
    } catch (error: any) {
      throw new PostgreError(error.message, error.code);
    }
  }

  async usagePromotion(payload: IPromotionUsage, dbTx: ITask<object>) {
    try {
      const query = `INSERT INTO promotion_usage (promotion_id, order_id, contact_id, total_discount) 
        VALUES ($<promotion_id>, $<order_id>, $<contact_id>, $<total_discount>) 
        RETURNING promotion_usage_id`;
      const result = await dbTx.oneOrNone(query, payload);
      return result;
    } catch (error: any) {
      throw new PostgreError(error.message, error.code);
    }
  }

  async bulkItemPromotion(payload: IGetPromotionItem[], dbTx: ITask<object>) {
    try {
      const columnSet = new pgp.helpers.ColumnSet(
        ["promotion_usage_id", "menu_id", "qty"],
        {
          table: "promotion_usage_detail",
        }
      );
      const query = pgp.helpers.insert(payload, columnSet);
      const result = dbTx.manyOrNone(query, payload);
      return result;
    } catch (error: any) {
      throw new PostgreError(error.message, error.code);
    }
  }
}
