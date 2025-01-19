import "dotenv/config";

const config = {
  APP_PORT: process.env.PORT,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PWD: process.env.DB_PWD,
  SECRET_KEY: process.env.SECRET_KEY,
};

export { config };
