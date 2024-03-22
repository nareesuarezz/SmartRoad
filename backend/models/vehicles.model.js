module.exports = (sequelize, Sequelize, models) => {
  const Vehicles = sequelize.define("Vehicles", {
    UID: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    Vehicle: {
      type: Sequelize.ENUM('car', 'bicycle')
    }
  });

  Vehicles.belongsTo(models.Admins, {
    foreignKey: 'Admin_UID',
    targetKey: 'UID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  return Vehicles;
};
