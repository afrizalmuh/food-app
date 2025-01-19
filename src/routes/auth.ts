import express from "express";
const routerUser = express.Router();
import { createAccount } from "../handler/auth";

routerUser.post("/create", createAccount);

export { routerUser };
