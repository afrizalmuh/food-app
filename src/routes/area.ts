import express from "express";
const routerArea = express.Router();
import { createArea } from "../handler/area";

routerArea.post("/create", createArea);

export { routerArea };
