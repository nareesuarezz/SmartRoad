  const db = require("../models");
  const Subscription = db.Subscription;
  const Op = db.Sequelize.Op;

  const webPush = require('web-push');

  exports.create = async (req, res) => {
    const subscriptionData = req.body.subscription;
    
    if (!subscriptionData) {
        return res.status(400).send({
            message: 'Invalid subscription data. Missing endpoint.'
        });
    }
    const subscription = {
      endpoint: req.body.subscription.endpoint,
      expirationTime: req.body.subscription.expirationTime,
      keys: JSON.stringify(req.body.subscription.keys),
      subscriptionName: req.body.subscriptionName,
      notificationPermission: req.body.notificationPermission 
    };
  
    try {
      const data = await Subscription.create(subscription);
  
      const subscriptionsInDB = await Subscription.findAll();
      for (const s of subscriptionsInDB) {
        const subscriptionRecipient = {
          endpoint: s.dataValues.endpoint,
          expirationTime: s.dataValues.expirationTime,
          keys: JSON.parse(s.dataValues.keys)
        };
  
        const title = `New Subscription`;
        const description = `${data.subscriptionName} is now subscribed`;
        await sendNotification(subscriptionRecipient, title, description);
      }
  
      res.status(201).send(data);
    } catch (err) {
      console.error(err);
  
      if (err.name === 'SequelizeValidationError') {
        res.status(400).send({
          message: err.errors.map((e) => e.message).join(', ')
        });
      } else {
        res.status(500).send({
          message: err.message || "Some error happened"
        });
      }
    }
  };

  exports.sendCustomNotification = async (req, res) => {
    try {
      const { subscriptionName, notificationMessage } = req.body;
  
      const subscriptionsInDB = await Subscription.findAll({
        where: { subscriptionName }
      });
  
      if (!subscriptionsInDB || subscriptionsInDB.length === 0) {
        throw new Error(`No subscriptions found for ${subscriptionName}`);
      }
  
      for (const s of subscriptionsInDB) {
        const subscriptionRecipient = {
          endpoint: s.dataValues.endpoint,
          expirationTime: s.dataValues.expirationTime,
          keys: JSON.parse(s.dataValues.keys)
        };
  
        const title = `Notification for ${subscriptionName}`;
        await sendNotification(subscriptionRecipient, title, notificationMessage);
      }
  
      res.send("Notification sent");
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: error.message || "Some error happened"
      });
    }
  };
  


  exports.findAll = (req, res) => {
    Subscription.findAll().then(data => {
      res.send(data)
    }).catch(err => {
      res.status(500).send({
        message: err.message || "some error happened"
      })
    })
  }

  exports.sendNotificationToSubscriptionName = (req, res) => {

    Subscription.findAll({
      where: {
        subscriptionName: req.body.subscriptionName
      }
    }).then((subscriptionsInDB) => {
      for (const s of subscriptionsInDB) {
        const subscriptionRecipient = {
          endpoint: s.dataValues.endpoint,
          expirationTime: s.dataValues.expirationTime,
          keys: JSON.parse(s.dataValues.keys)
        }
        const title = `Just for ${req.body.subscriptionName}`;
        const description = req.body.notificationMessage;
        sendNotification(subscriptionRecipient, title, description);
      }
      res.send("notification sent")
    }).catch(err => {
      res.status(500).send({
        message: err.message || "some error happened"
      })
    });
  }

  exports.findOne = (req, res) => {
  }

  exports.update = (req, res) => {
  }

  exports.deleteByEndpoint = async (req, res) => {
    try {
      const endpointToDelete = req.body.endpoint;
  
      const subscriptionToDelete = await Subscription.findOne({
        where: {
          endpoint: endpointToDelete
        }
      });
  
      if (!subscriptionToDelete) {
        return res.status(404).send("Endpoint not found");
      }
  
      await Subscription.destroy({
        where: {
          id: subscriptionToDelete.id
        }
      });
  
      const subscriptionRecipient = {
        endpoint: subscriptionToDelete.endpoint,
        expirationTime: subscriptionToDelete.expirationTime,
        keys: JSON.parse(subscriptionToDelete.keys)
      };
      const title = `Subscription to ${subscriptionToDelete.subscriptionName} deleted`;
      const description = "";
      sendNotification(subscriptionRecipient, title, description);
  
      const remainingSubscriptions = await Subscription.findAll();
  
      for (let s of remainingSubscriptions) {
        const remainingSubscriptionRecipient = {
          endpoint: s.dataValues.endpoint,
          expirationTime: s.dataValues.expirationTime,
          keys: JSON.parse(s.dataValues.keys)
        };
        const remainingTitle = `Subscription to ${subscriptionToDelete.subscriptionName} deleted`;
        sendNotification(remainingSubscriptionRecipient, remainingTitle, description);
      }
  
      res.status(200).send("Subscription deleted");
    } catch (err) {
      res.status(500).send({
        message: err.message || "Some error happened"
      });
    }
  };
  
  

  const sendNotification = async (subscriptionRecipient, title, description, location) => {
    console.log('Sending notification:', subscriptionRecipient, title, description);  
  
    const options = {
      vapidDetails: {
        subject: 'mailto:myemail@example.com',
        publicKey: process.env.PUBLIC_KEY,
        privateKey: process.env.PRIVATE_KEY,
      },
    };
    try {
      await webPush.sendNotification(
        subscriptionRecipient,
        JSON.stringify({
          title,
          description,
          image: 'https://cdn-icons-png.flaticon.com/512/752/752755.png',
          location, // Agrega la ubicación a los datos de la notificación
        }),
        options
      );
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
  