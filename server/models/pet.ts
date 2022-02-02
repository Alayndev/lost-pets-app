import { Model, DataTypes } from "sequelize";

import { sequelize } from "./connection";

class Pet extends Model {}

// Pet model - Pets table:
Pet.init(
  {
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lat: {
      type: DataTypes.STRING, // Quizá deba ser un FLOAT para consumirlo desde el Front más comodamente, Algolia lo convierte en string para hacer _geosearch
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
