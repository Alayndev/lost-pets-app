import { Model, DataTypes } from "sequelize";

import { sequelize } from "./connection";

class Report extends Model {}

Report.init(
  {
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lat: {
      type: DataTypes.STRING,
    },

    lng: {
      type: DataTypes.STRING,
    },

    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "report",
  }
);

export { Report };
