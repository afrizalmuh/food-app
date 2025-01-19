import { IArea, IRequestArea } from "../interfaces/area";
import { IQueryParams } from "../interfaces/http";
import { IMenu, IRequestMenu, IRequestMenuCategory } from "../interfaces/menu";
import { AreaRepository } from "../repository/area";
import { MenuRepository } from "../repository/menu";
interface AreaServiceDepedencies {
  areaRepository: AreaRepository;
}

export class AreaService {
  private areaRepository: AreaRepository;

  constructor({ areaRepository }: AreaServiceDepedencies) {
    this.areaRepository = areaRepository;
  }

  async createArea(payload: IRequestArea) {
    if (payload.area.length === 0)
      throw { statusCode: 400, message: "Area cant be empty" };

    const request = payload.area.map((area) => ({
      ...area,
      created_by: payload.created_by,
    }));
    console.log("request = ", request);
    await this.areaRepository.createArea(request);
  }
}
