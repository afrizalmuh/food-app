export interface ICustomer {
  customer_id?: number;
  first_name: string;
  last_name: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  area_id: number;
}

export interface IUser extends ICustomer {
  user_id?: number;
  username: string;
  password: string;
}

export type IResponseUser = Pick<
  IUser,
  "username" | "first_name" | "gender" | "phone"
>;
