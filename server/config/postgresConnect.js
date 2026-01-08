const { Sequelize } = require("sequelize");

const { DB_NAME, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;

const postgres = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "postgres",
  port: Number(DB_PORT),
  logging: console.log, // temporarily log queries for debugging

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },

  pool: {
    max: 10, // keep small to avoid connection slot issues
    min: 0,
    acquire: 30000,
    idle: 10000,
  },

  retry: {
    max: 3,
  },
});

// Test function
const testPostgresConnection = async () => {
  try {
    console.log("🔹 Attempting DB connection...");
    await postgres.authenticate();
    console.log("✅ Database connection authenticated.");

    await postgres.sync({ alter: false }); // safer than alter:true in prod
    console.log("👾 Database synced successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to Postgres:", error.message);
    console.error(error); // show full error object
  }
};

// Close DB on exit
process.on("SIGINT", async () => {
  try {
    await postgres.close();
    console.log("💤 Database connection closed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error closing DB connection:", err);
    process.exit(1);
  }
});

module.exports = { postgres, testPostgresConnection };
