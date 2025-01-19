export interface IResponse<TData = any> {
  data?: TData;
  success: boolean;
  message?: string;
  statusCode: number;
  totalCount?: number;
  token?: string;
}
