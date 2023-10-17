// models/user.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelizeConfig = require("../config/config"); // Import your Sequelize configuration

const sequelize = new Sequelize(sequelizeConfig.development);
const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    roll_no: {
      type: DataTypes.INTEGER,
    },
    year: {
      type: DataTypes.INTEGER,
    },
    branch: {
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.STRING,
    },
    fingerprint_id: {
      type: DataTypes.INTEGER,
      allowNull:true,
      defaultValue:null,
    },
    role: {
      type: DataTypes.STRING, // Set the data type to VARCHAR
      defaultValue: null, // Set the default value to null
    },
  },
  {
    timestamps: false, // Disable createdAt and updatedAt columns
  }
);

module.exports = User;
