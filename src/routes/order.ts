import express from "express";
const routerOrder = express.Router();
import { createOrder } from "../handler/order";

routerOrder.post("/", createOrder);

export { routerOrder };
