const db = require("../models");
const Subscription = db.subscriptions;
const Op = db.Sequelize.Op;

const webPush = require('web-push');

exports.create = (req, res) => {
  // TODO: validate req.body

  const subscription = {
    endpoint: req.body.subscription.endpoint,
    expirationTime: req.body.subscription.expirationTime,
    keys: JSON.stringify(req.body.subscription.keys),
    subscriptionName: req.body.subscriptionName
  }

  Subscription.create(subscription).then(async (data) => {
    Subscription.findAll().then((subscriptionsInDB) => {
      for (let s of subscriptionsInDB) {
        const subscriptionRecipient = {
          endpoint: s.dataValues.endpoint,
          expirationTime: s.dataValues.expirationTime,
          keys: JSON.parse(s.dataValues.keys)
        }

        const title = `New Subscription`;
        const description = `${data.subscriptionName} is now subscribed`;
        sendNotification(subscriptionRecipient, title, description);
      }
    }).catch(err => {
      res.status(500).send({
        message: err.message || "some error happened"
      })
    });
  }).catch(err => {
    res.status(500).send({
      message: err.message || "some error happened"
    })
  })
}

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
  // TODO: validate req.body

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
  //TODO:
}

exports.update = (req, res) => {
  //TODO:
}

exports.deleteByEndpoint = (req, res) => {
  // TODO: validate req.body

  Subscription.findOne({
    where: {
      endpoint: req.body.endpoint
    }
  }).then((subscriptionToDelete) => {
    if (!subscriptionToDelete) {
      res.send("endpoint not found");
      return
    }

    Subscription.destroy({
      where: {
        id: subscriptionToDelete.id
      }
    }).then(() => {
      Subscription.findAll().then((subscriptionsInDB) => {
        for (let s of subscriptionsInDB) {
          const subscriptionRecipient = {
            endpoint: s.dataValues.endpoint,
            expirationTime: s.dataValues.expirationTime,
            keys: JSON.parse(s.dataValues.keys)
          }
          const title = `Subscription to ${subscriptionToDelete.subscriptionName} deleted`;
          const description = "";
          sendNotification(subscriptionRecipient, title, description);
        }
      }).catch(err => {
        res.status(500).send({
          message: err.message || "some error happened"
        })
      });
      res.status(200).send("subscription deleted");
    }).catch(err => {
      res.status(500).send({
        message: err.message || "some error happened"
      })
    });
  })
}

const sendNotification = async (subscriptionRecipient, title, description) => {
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
        image: 'https://cdn2.vectorstock.com/i/thumb-large/94/66/emoji-smile-icon-symbol-smiley-face-vector-26119466.jpg',
      }),
      options
    );
  } catch (error) {
    throw (error);
  }
}