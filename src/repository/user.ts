import { IResponseUser, IUser } from "../interfaces/auth";
import { PostgreError } from "../lib/exception";
import { pg } from "../lib/pg-connection";

export class UserRepository {
  private DB = pg;

  constructor() {
    this.DB = pg;
  }

  async createUser(payload: IUser): Promise<IResponseUser> {
    try {
      const customer = {
        first_name: payload.first_name,
        last_name: payload.last_name,
        gender: payload.gender,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        area_id: payload.area_id,
        created_by: payload.username,
      };

      const queryCustomer = `        
        INSERT INTO customer (
          first_name, last_name, gender, email, phone, address, area_id, created_by
        ) VALUES (
          $<first_name>, $<last_name>, $<gender>, $<email>, $<phone>, $<address>, $<area_id>, $<created_by>
        ) RETURNING *`;

      const resultCustomer = await this.DB.query(queryCustomer, customer);

      const user = {
        username: payload.username,
        password: payload.password,
        customer_id: resultCustomer.customer_id,
        created_by: payload.username,
      };

      const queryUser = `        
        INSERT INTO users (
          username, password, customer_id, created_by
        ) VALUES (
          $<username>, $<password>, $<customer_id>, $<username>
        ) RETURNING username`;

      const resultUser = await this.DB.query(queryUser, user);
      return {
        username: resultUser,
        first_name: payload.first_name,
        gender: payload.gender,
        phone: payload.phone,
      };
    } catch (error: any) {
      throw new PostgreError(error.message, error.code);
    }
  }

  async findUser(username: string): Promise<Pick<IUser, "username">> {
    try {
      const query = `SELECT username FROM users WHERE username = $<username>`;
      const result = await this.DB.oneOrNone(query, { username });
      return result;
    } catch (err: any) {
      throw new PostgreError(err.message, err.code);
    }
  }
}
