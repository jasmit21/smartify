// models/user.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelizeConfig = require("../config/config");
const Attendance = require("./attendancemodel");
const sequelize = new Sequelize(sequelizeConfig.development);

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  },
  role: {
    type: DataTypes.STRING,
  },
  // Define other columns if needed
});

User.associate = (models) => {
  User.hasMany(Attendance, { foreignKey: 'user_id' });
};


module.exports = User;
