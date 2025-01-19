export interface IRequestMenuCategory {
  menu_category: IMenuCategory[];
  created_by: string;
}

export interface IRequestMenu {
  menu: IMenu[];
  created_by: string;
}

export interface IMenuCategory {
  category_id?: number;
  category_name: string;
  created_by?: string;
}

export interface IMenu {
  menu_id?: number;
  category_id?: number;
  category_name?: string;
  menu_name: string;
  avaibility: boolean;
  sell_price: number;
  description?: number;
  created_by?: string;
}
