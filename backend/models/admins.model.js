module.exports = (sequelize, Sequelize) => {
  const Admins = sequelize.define("Admins", {
    UID: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    Username: {
      type: Sequelize.STRING
    },
    Password: {
      type: Sequelize.STRING
    },
    filename: {
      type: Sequelize.STRING
    },
    Role: {
      type: Sequelize.ENUM('Admin', 'User')
    }
  });

  // Relación con la tabla Vehicles
  Admins.associate = models => {
    Admins.hasMany(models.Vehicles, {
      foreignKey: 'Admin_UID',
      sourceKey: 'UID',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    })
  };

  return Admins;
};
