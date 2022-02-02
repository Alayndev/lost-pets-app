import { Model, DataTypes } from "sequelize";

import { sequelize } from "./connection";

class Auth extends Model {}

// Auth model - Auths table:
Auth.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "auth",
  }
);

export { Auth };
