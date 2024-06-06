module.exports = (sequelize, Sequelize) => {
  const Routes = sequelize.define("Routes", {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    from: {
      type: Sequelize.GEOMETRY('POINT'),
    },
    to: {
      type: Sequelize.GEOMETRY('POINT'),
    },
    AdminId: {
      type: Sequelize.BIGINT,
      references: {
        model: 'Admins', // nombre del modelo de la tabla referenciada
        key: 'UID', // nombre del campo que se va a referenciar
      }
    }
  });

  Routes.associate = models => {
    Routes.belongsTo(models.Admins, {
      foreignKey: 'AdminId',
      targetKey: 'UID',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return Routes;
};
