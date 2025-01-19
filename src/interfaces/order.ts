import { IGetPromotionCustomer, IGetPromotionItem } from "./promotion";

export interface IOrder {
  order_id?: number;
  order_no: string;
  subtotal: number;
  order_menu: IOrderMenu[];
  promotion?: IOrderPromotion[];
  customer: ICustomerOrder;
  customer_id?: number;
  total_disc?: string;
  notes?: string;
  current_date: Date | string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface IOrderMenu {
  menu_id: number;
  quantity: number;
  sell_price: number;
}

export interface IOrderPromotion {
  promotion_id: number;
  total_discount: number;
  items: IGetPromotionItem[];
}

export type ICustomerOrder = IGetPromotionCustomer;
