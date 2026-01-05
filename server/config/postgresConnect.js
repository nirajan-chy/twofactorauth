const { Sequelize } = require("sequelize");
const { DB_NAME, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_DIALECT, DB_PORT, SSL } =
  process.env;

const postgres = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT || "postgres",
  port: DB_PORT,
  timezone: "+05:45",
  logging: false,
  pool: {
    max: 3,
    min: 0,
    acquire: 30000,
    idle: 10000,
    evict: 5000,
  },
  dialectOptions: {
    ssl:
      SSL === "true" || SSL === "require"
        ? { require: true, rejectUnauthorized: false }
        : false,
  },
  retry: {
    max: 3,
  },
});

const testPostgresConnection = async () => {
  try {
    await postgres.authenticate();
    console.info("✅ Database connection authenticated.");

    await postgres.sync({ alter: true });
    console.info("👾 Database synced successfully.");

    const pool = postgres.connectionManager.pool;
    console.info(
      `📊 Connection Pool - Max: ${pool.max}, Min: ${pool.min}, Current: ${pool.size}`
    );
  } catch (error) {
    console.error("❌ Unable to connect to Postgres:", error.message);
    console.error(
      "💡 Tip: Your database may have too many active connections. Try:"
    );
    console.error("   1. Close other apps/terminals connected to the database");
    console.error("   2. Wait a few minutes for idle connections to close");
    console.error("   3. Restart your database from Aiven dashboard");
  }
};

process.on("SIGINT", async () => {
  try {
    await postgres.close();
    console.log("💤 Database connection closed due to app termination.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error closing DB connection:", err);
    process.exit(1);
  }
});

module.exports = { postgres, testPostgresConnection };
