import { IQueryParams } from "../interfaces/http";
import { IMenu, IRequestMenu, IRequestMenuCategory } from "../interfaces/menu";
import { MenuRepository } from "../repository/menu";
interface MenuServiceDepedencies {
  menuRepository: MenuRepository;
}

export class MenuService {
  private menuRepository: MenuRepository;

  constructor({ menuRepository }: MenuServiceDepedencies) {
    this.menuRepository = menuRepository;
  }

  async createMenuCategory(payload: IRequestMenuCategory) {
    if (payload.menu_category.length === 0)
      throw { statusCode: 400, message: "Category cant be empty" };

    const request = payload.menu_category.map((menu) => ({
      ...menu,
      created_by: payload.created_by,
    }));
    await this.menuRepository.createMenuCategory(request);
  }

  async createMenu(payload: IRequestMenu) {
    if (payload.menu.length === 0)
      throw { statusCode: 400, message: "Menu cant be empty" };

    const checkCategory = payload.menu
      .map((menu) => menu.category_id)
      .filter((categoryId): categoryId is number => categoryId !== undefined);

    const validateCategory = await this.menuRepository.findMenuCategoryById(
      checkCategory
    );

    if (payload.menu.length !== validateCategory.length)
      throw { statusCode: 400, message: "Category doesn't exist" };

    const request = payload.menu.map((menu) => ({
      ...menu,
      created_by: payload.created_by,
    }));
    await this.menuRepository.createMenu(request);
  }

  async listMenu(args: IQueryParams): Promise<IMenu[]> {
    return await this.menuRepository.listMenu(args);
  }
}
