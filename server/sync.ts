import { sequelize } from "./models/connection";
import "./models";

// SYNC:
(async () => {
  const resp = await sequelize.sync({ force: true });
  console.log(resp);
})();
