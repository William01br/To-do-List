import Sequelize from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: "db",
    dialect: "postgres",
    logging: false,
  }
);

const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("connection successful with DB");
  } catch (err) {
    console.error("error connecting:", err);
  }
};

export { sequelize, testDbConnection };
