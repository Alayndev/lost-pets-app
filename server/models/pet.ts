import { Model, DataTypes } from "sequelize";

import { sequelize } from "./connection";

class Pet extends Model {}

Pet.init(
  {
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lat: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lng: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.STRING,
    },

    state: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },

    pictureURL: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "pet",
  }
);

export { Pet };
