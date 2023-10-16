// models/activesession.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelizeConfig = require("../config/config");
const sequelize = new Sequelize(sequelizeConfig.development);

const ActiveSession = sequelize.define('ActiveSession', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    SessionId: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.DATE,
      allowNull: false,
    },
    TimeSlot: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Define other columns if needed
  });

  ActiveSession.associate = (models) => {
    ActiveSession.hasMany(models.Attendance, { foreignKey: 'SessionId' });
};


module.exports = ActiveSession;
