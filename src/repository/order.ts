import { ITask } from "pg-promise";
import { IResponseUser, IUser } from "../interfaces/auth";
import { IOrder, IOrderMenu } from "../interfaces/order";
import { PostgreError } from "../lib/exception";
import { pg, pgp } from "../lib/pg-connection";

export class OrderRepository {
  private DB = pg;

  constructor() {
    this.DB = pg;
  }

  async createOrder(payload: IOrder, dbTx: ITask<object>) {
    try {
      const query = `
        INSERT INTO orders (order_no, total_disc, subtotal, notes, customer_id, created_by)
        VALUES ($<order_no>, $<total_disc>, $<subtotal>, $<notes>, $<customer_id>, $<created_by>) 
        RETURNING order_id
      `;
      return dbTx.oneOrNone(query, payload);
    } catch (error: any) {
      throw new PostgreError(error.message, error.code);
    }
  }

  async createOrderDetail(payload: IOrderMenu[], dbTx: ITask<object>) {
    try {
      const columnSet = new pgp.helpers.ColumnSet(
        ["order_id", "menu_id", "quantity", "sell_price"],
        {
          table: "order_menu",
        }
      );
      const query = pgp.helpers.insert(payload, columnSet);
      return dbTx.manyOrNone(query);
    } catch (error: any) {
      throw new PostgreError(error.message, error.code);
    }
  }
}
