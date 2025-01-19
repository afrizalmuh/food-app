import express from "express";
const baseRouter = express.Router();

import { routerUser } from "./auth";
import { routerMenu } from "./product-menu";
import { routerPromotion } from "./promotion";
import { routerOrder } from "./order";
import { routerArea } from "./area";

baseRouter.use("/auth", routerUser);
baseRouter.use("/menu", routerMenu);
baseRouter.use("/promotion", routerPromotion);
baseRouter.use("/order", routerOrder);
baseRouter.use("/area", routerArea);

export { baseRouter };
