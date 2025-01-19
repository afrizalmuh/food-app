import express from "express";
const routerMenu = express.Router();
import { createMenu, createMenuCategory, listMenu } from "../handler/menu";

routerMenu.post("/category", createMenuCategory);
routerMenu.post("/", createMenu);
routerMenu.get("/", listMenu);

export { routerMenu };
