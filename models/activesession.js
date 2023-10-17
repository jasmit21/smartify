// models/activesession.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelizeConfig = require("../config/config");
const sequelize = new Sequelize(sequelizeConfig.development);

const ActiveSession = sequelize.define(
  "ActiveSessions",
  {
    SessionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    TeacherName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    TimeSlot: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN, // Define the 'isActive' column as a boolean
      defaultValue: true, // Set a default value (0 or 1)
    },
  },
  {
    timestamps: false, // Set timestamps to false
  }
);

ActiveSession.associate = (models) => {
  ActiveSession.hasMany(models.Attendance, { foreignKey: "SessionId" });
};

module.exports = ActiveSession;
