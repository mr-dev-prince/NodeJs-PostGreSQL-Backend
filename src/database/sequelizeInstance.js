import { Sequelize } from "sequelize";
import config from "../config/config.json" assert { type: "json" };

const { database, username, password, host, port, dialect } =
  config.development;

export const sequelize = new Sequelize(database, username, password, {
  host: host,
  port: port,
  dialect: dialect,
  dialectOptions: {
    connectionTimeout: 10000,
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});
