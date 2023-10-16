const { Sequelize, DataTypes } = require("sequelize");
const sequelizeConfig = require("../config/config");
const ActiveSession = require("./activesession");
const User = require("./usermodel");
const sequelize = new Sequelize(sequelizeConfig.development);

const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    AttendanceId: {
      type: DataTypes.INTEGER,
    },
    SessionId: {
      type: DataTypes.INTEGER,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    // Define other columns (Name, Branch, Year, RollNo, createdAt, updatedAt) as needed
  });

  Attendance.associate = (models) => {
  Attendance.belongsTo(models.ActiveSession, { foreignKey: 'SessionId' });
};

module.exports = Attendance;
