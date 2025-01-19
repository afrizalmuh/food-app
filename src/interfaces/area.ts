export interface IArea {
  area_id?: number;
  area_name: string;
  area_code: string;
  created_at?: Date | string;
  modified_at?: Date | string;
  created_by?: string;
  updated_by?: string;
}

export interface IRequestArea {
  area: IArea[];
  created_by: string;
}
