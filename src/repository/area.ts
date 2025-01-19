import { IArea, IRequestArea } from "../interfaces/area";
import { PostgreError } from "../lib/exception";
import { pg, pgp } from "../lib/pg-connection";

export class AreaRepository {
  private DB = pg;

  constructor() {
    this.DB = pg;
  }

  async createArea(payload: IArea[]) {
    try {
      console.log("payload = ", payload);
      const columnSet = new pgp.helpers.ColumnSet(
        ["area_name", "area_code", "created_by"],
        {
          table: "area",
        }
      );

      const query = pgp.helpers.insert(payload, columnSet);
      const result = await this.DB.manyOrNone(query);
      return result;
    } catch (error: any) {
      throw new PostgreError(error.message, error.code);
    }
  }
}
