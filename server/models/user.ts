import { Model, DataTypes } from "sequelize";

import { sequelize } from "./connection";

class User extends Model {}

User.init(
  {
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    state: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    sequelize,
    modelName: "user",
  }
);

export { User };
