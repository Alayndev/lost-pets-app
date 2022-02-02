import { sequelize } from "./models/connection";
import "./models";

// SYNC:
(async () => {
  const resp = await sequelize.sync({ alter: true });
   console.log(resp);
})();
