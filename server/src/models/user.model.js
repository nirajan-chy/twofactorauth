const { DataTypes } = require("sequelize");
const { postgres } = require("../../config/postgresConnect");

const User = postgres.define(
  "user",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false, // make password required
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "user",
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = { User };
