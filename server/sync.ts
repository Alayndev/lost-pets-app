import { sequelize } from "./models/connection";
import "./models";

// SYNC - DB POSTGRES HEROKU:
(async () => {
  const resp = await sequelize.sync({ alter: true });
  console.log(resp);
})();
