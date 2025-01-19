export const getSqlLimitFragment = (pageIndex: number, pageSize: number) => {
  if (pageSize && pageSize > 200) {
    throw new Error("pageSize cannot exceed 200 per request");
  }

  let fragment = "";
  if (pageSize) {
    fragment = ` limit ${pageSize}`;

    if (pageIndex) {
      const offset = (pageIndex - 1) * pageSize;
      fragment += ` offset ${offset}`;
    }
  }
  return fragment;
};
