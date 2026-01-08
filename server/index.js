const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const express = require("express");
const userRouter = require("./src/routes/user.route");
const { testPostgresConnection } = require("./config/postgresConnect");
const { DB_PORT } = require("./api/env");
const twoFARouter = require("./src/routes/2fa.route");

const app = express();

app.use(express.json());

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies if needed
  })
);

const PORT = process.env.PORT || 5000;

app.use("/user", userRouter);
app.use("/2fa", twoFARouter);

testPostgresConnection();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
