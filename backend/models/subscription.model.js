const { sequelize } = require(".");

module.exports = (sequelize, Sequelize) => {
  const Subscription = sequelize.define("subscription", {
    endpoint: {
      type: Sequelize.TEXT
    },
    expirationTime: {
      type: Sequelize.INTEGER
    },
    keys: {
      type: Sequelize.STRING
    },
    subscriptionName: {
      type: Sequelize.STRING
    }
  });

  return Subscription;
}