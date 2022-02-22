import { Sequelize } from "sequelize";
import "dotenv/config";

const sequelize = new Sequelize({
  dialect: "postgres",

  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,

  port: parseInt(process.env.POSTGRES_PORT),
  host: process.env.POSTGRES_HOST,

  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

const test = async function testingConnection() {
  return sequelize
    .authenticate()
    .then(() => console.log("Connection has been established successfully."))
    .catch((err) => console.log("Error: " + err));
};

export { sequelize, test };
