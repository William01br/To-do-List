import Sequelize from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: console.log,
    define: {
      timestamps: true,
    },
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
