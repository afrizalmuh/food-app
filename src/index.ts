import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { ResponseSuccess } from "./utils/response";
import { config } from "./constant/config";
import { baseRouter } from "./routes";

dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(cors());

const port = config.APP_PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  // Call the ResponseSuccess function without returning it
  ResponseSuccess(res, { message: "SERVER RUNNING", statusCode: 200 });
});

app.use("/api/", baseRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;
