module.exports = (sequelize, Sequelize) => {
  const Logs = sequelize.define("Logs", {
    Log_ID: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    Action: {
      type: Sequelize.STRING,
    }
  });

  Logs.associate = models => {
    Logs.belongsTo(models.Admins, {
      foreignKey: 'Admin_UID',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Logs.belongsTo(models.Tracks, {
      foreignKey: 'Track_ID',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };



  return Logs;
};
