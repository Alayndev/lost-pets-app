import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  dialect: "postgres",
  username: "wfntlrzrmfyisi",
  password: "08b45766436afcd3fc57f03f0a13e9ccb312f42e29be35a5a6f230f455fd433e",
  database: "dcu1km25bjk7oo",
  port: 5432,
  host: "ec2-3-209-234-80.compute-1.amazonaws.com",

  // Esto es necesario para que corra correctamente
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

export { sequelize };
