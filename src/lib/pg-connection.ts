import pgPromise, { IDatabase } from "pg-promise";
import { IClient } from "pg-promise/typescript/pg-subset";

import { config } from "../constant/config";

export interface DBConfig {
  client: string;
  connection: Connection;
}

export interface Connection {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
  poolsize?: number;
  max?: number;
  idleTimeoutMillis?: number;
}

const dbConfig: DBConfig = {
  client: "pg",
  connection: {
    host: config.DB_HOST as string,
    port: Number(config.DB_PORT),
    database: config.DB_NAME as string,
    user: config.DB_USER as string,
    password: config.DB_PWD as string,
    idleTimeoutMillis: 60000,
    max: 50,
  },
};

const pgp = pgPromise();

const pg: IDatabase<object, IClient> = pgp(dbConfig.connection);

export { pgp, pg };
