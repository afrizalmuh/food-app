import express from "express";
const routerPromotion = express.Router();
import {
  createAndUpdatePromotion,
  getPromotion,
  list,
} from "../handler/promotion";

routerPromotion.post("/", createAndUpdatePromotion);
routerPromotion.post("/item", getPromotion);
routerPromotion.get("/", list);

export { routerPromotion };
