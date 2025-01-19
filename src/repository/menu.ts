import { IQueryParams } from "../interfaces/http";
import { IMenu, IMenuCategory } from "../interfaces/menu";
import { PostgreError } from "../lib/exception";
import { pg, pgp } from "../lib/pg-connection";
import { getSqlLimitFragment } from "../lib/query";

export class MenuRepository {
  private DB = pg;

  constructor() {
    this.DB = pg;
  }

  async createMenuCategory(payload: IMenuCategory[]) {
    try {
      const columnSet = new pgp.helpers.ColumnSet(
        ["category_name", "created_by"],
        {
          table: "menu_category",
        }
      );

      const query = pgp.helpers.insert(payload, columnSet) + " RETURNING *";
      const result = await this.DB.manyOrNone(query);
      return result;
    } catch (error: any) {
      throw new PostgreError(error.message, error.code);
    }
  }

  async findMenuCategory(
    categoryName: string
  ): Promise<Pick<IMenuCategory, "category_name">> {
    try {
      const query = `SELECT category_name FROM users WHERE category_name = $<category_name>`;
      const result = await this.DB.oneOrNone(query, { categoryName });
      return result;
    } catch (err: any) {
      throw new PostgreError(err.message, err.code);
    }
  }

  async findMenuCategoryById(
    categoryId: number[]
  ): Promise<Pick<IMenuCategory, "category_id">[]> {
    try {
      const query = `SELECT category_id FROM menu_category WHERE category_id in ($1:csv)`;
      const result = await this.DB.manyOrNone(query, [categoryId]);
      return result;
    } catch (err: any) {
      throw new PostgreError(err.message, err.code);
    }
  }

  async createMenu(payload: IMenu[]) {
    try {
      const columnSet = new pgp.helpers.ColumnSet(
        [
          "menu_name",
          "category_id",
          "sell_price",
          "avaibility",
          "description",
          "created_by",
        ],
        {
          table: "menu",
        }
      );
      const query = pgp.helpers.insert(payload, columnSet) + " RETURNING *";
      const result = await this.DB.manyOrNone(query);
      return result;
    } catch (err: any) {
      throw new PostgreError(err.message, err.code);
    }
  }

  async listMenu(args: IQueryParams): Promise<IMenu[]> {
    try {
      const {
        page = 1,
        pageSize = 25,
        q,
        sortBy = "menu_name",
        sortDirection = "asc",
      } = args;
      const limitOffset = getSqlLimitFragment(page, pageSize);
      let where = "";
      if (q && q !== "") {
        where = ` AND m.menu ~* $<q>`;
      }

      if (sortBy) {
        where += ` ORDER BY ${sortBy} ${sortDirection}`;
      }

      const query = `
        SELECT m.menu_id, m.category_id, m.menu_name, mc.category_name, m.sell_price, m.avaibility, m.description FROM menu m 
        left join menu_category mc on m.category_id = mc.category_id WHERE m.avaibility is true
        ${where} 
        ${limitOffset}`;
      const result = await this.DB.manyOrNone(query, { q });
      return result;
    } catch (err: any) {
      throw new PostgreError(err.message, err.code);
    }
  }
}
