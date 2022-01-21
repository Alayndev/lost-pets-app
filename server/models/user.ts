import { Model, DataTypes } from "sequelize";

import { sequelize } from "./connection";

class User extends Model {}

User.init(
  {
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    bio: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    pictureURL: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "user",
  }
);

export { User };
