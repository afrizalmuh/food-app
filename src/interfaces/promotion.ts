import { ICustomer } from "./auth";

export interface IPromotion {
  promotion_id?: number;
  promotion_name: string;
  quota: number;
  minimum_spending: number;
  customer_target_type: string;
  is_limited: boolean;
  start_date: Date | string;
  end_date: Date | string;
  promotion_rewards: IPromotionRewards;
  promotion_reward_menu: IPromotionRewardMenu[];
  promotion_customer: IPromotionCustomer[];
  promotion_menu_rules: IPromotionRules[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IPromotionRewards {
  promotion_reward_id?: number;
  promotion_id?: number;
  reward_type: string;
  discount_type: string;
  discount_amount: number;
  max_discount_amount: number;
}

export interface IPromotionRules {
  promotion_menu_rule_id?: number;
  promotion_id?: number;
  quantity: number;
  target_id: number;
}

export interface IPromotionRewardMenu {
  promotion_reward_menu_id?: number;
  promotion_reward_id?: number;
  target_id: number;
  quantity: number;
  menu_name: string;
  sell_price: number;
  total_price?: number;
}

export interface IPromotionCustomer {
  promotion_customer_id?: number;
  promotion_id?: number;
  target_id: number;
}

export type IRequestPromotion = Omit<
  IPromotion,
  | "promotion_rewards"
  | "promotion_customer"
  | "promotion_menu_rules"
  | "promotion_rule_items"
>;

export interface IGetPromotion {
  current_date: Date | string;
  customer: IGetPromotionCustomer;
  items: IGetPromotionItem[];
  grand_total: number;
  promotions?: IValidatePromotionList[];
}

export interface IValidatePromotionList {
  promotion_id: number;
  voucher_code?: string;
}

export interface IPromotionUsage {
  promotion_usage_id?: number;
  promotion_id: number;
  order_id: number;
  contact_id: number;
  total_discount: number;
  items?: IGetPromotionItem[];
}

export interface IGetPromotionItem {
  promotion_usage_id?: number;
  menu_id: number;
  qty: number;
  amount?: number;
}

export type IGetPromotionCustomer = Pick<ICustomer, "customer_id" | "area_id">;

export type IFilterPromotion = Omit<
  IPromotion,
  "promotion_rewards" | "promotion_customer" | "promotion_rule_items"
>;

export type IRewardPromotion = IRequestPromotion & {
  discount_reward: IPromotionRewards[] | null;
  item_reward: IPromotionRewardMenu[] | null;
};
