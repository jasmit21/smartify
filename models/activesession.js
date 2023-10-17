// models/activesession.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelizeConfig = require("../config/config");
const sequelize = new Sequelize(sequelizeConfig.development);

const ActiveSession = sequelize.define('ActiveSessions', {
    
    SessionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull:false
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
    },},
    {
      timestamps: false, // Set timestamps to false
    });

  ActiveSession.associate = (models) => {
    ActiveSession.hasMany(models.Attendance, { foreignKey: 'SessionId' });
};


module.exports = ActiveSession;
