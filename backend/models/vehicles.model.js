module.exports = (sequelize, Sequelize) => {
  const Vehicles = sequelize.define("Vehicles", {
    UID: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    Vehicle: {
      type: Sequelize.ENUM('car', 'bicycle')
    },
    Admin_UID: {
      type: Sequelize.BIGINT
    }
  });
  
  Vehicles.associate = models => {
    Vehicles.belongsTo(models.Admins, {
      foreignKey: 'Admin_UID',
      targetKey: 'UID',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };
  return Vehicles;
};
