export interface IQueryParams {
  q?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc" | "ASC" | "DESC";
  [key: string]: unknown;
}
