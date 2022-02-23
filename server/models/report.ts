import { Model, DataTypes } from "sequelize";

import { sequelize } from "./connection";

class Report extends Model {}

// Report model - Reports table:
Report.init(
  {
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phoneNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    report: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lat: {
      type: DataTypes.FLOAT,
    },

    lng: {
      type: DataTypes.FLOAT,
    },
  },
  {
    sequelize,
    modelName: "report",
  }
);

export { Report };

// userId - petId
