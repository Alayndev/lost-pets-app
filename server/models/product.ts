import { Model, DataTypes } from "sequelize";

import { sequelize } from "./connection"; // Connection to RDB (Heroku Postgres)

class Product extends Model {}

Product.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "product",
  }
);

export { Product };
