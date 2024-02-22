module.exports = (sequelize, Sequelize) => {

  function findTrackByDistance(track) {
    // Lógica que deseas ejecutar con el track
    console.log('Se ha creado un nuevo track para un vehículo específico:', track);
    // Aquí deberías incluir lo que necesites hacer con el track
    // Por ejemplo, podrías enviar una notificación, procesar datos, etc.
  }

  const Tracks = sequelize.define("Tracks", {
    ID: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    Location: {
      type: Sequelize.GEOMETRY('POINT', 4326),
      allowNull: false,
    },
    Status: {
      type: Sequelize.ENUM('Stopped', 'Moving')
    },
    Speed: {
      type: Sequelize.DECIMAL
    },
    Extra: {
      type: Sequelize.JSON
    },
    Date: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    // hooks: {
    //   afterCreate: async (track, options) => {
    //     try {
    //       // Encuentra el vehículo asociado al track
    //       const vehicle = await track.getVehicle(); // Utiliza la asociación definida en el modelo para obtener el vehículo
    //       console.log(vehicle.Vehicle)
    //       // Verifica el tipo de vehículo
    //       if (vehicle.Vehicle === 'car') {
    //         // Si es un Car o un Bicycle, ejecuta tu función
            
    //         findTrackByDistance(track, vehicle.Vehicle);
    //       }
    //     } catch (error) {
    //       console.error('Error al verificar el tipo de vehículo:', error);
    //     }
    //   }
    // }
    
  });

  Tracks.associate = models => {
    Tracks.belongsTo(models.Vehicles, {
      foreignKey: 'Vehicle_UID',
      targetKey: 'UID',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return Tracks;
};
