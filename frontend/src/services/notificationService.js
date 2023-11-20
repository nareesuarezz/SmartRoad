import axios from 'axios';

// const API = "http://localhost:8080/api/subscriptions";
const API = process.env.REACT_APP_API_URL;

function unregisterAllServiceWorkers() {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

async function regSw() {
  if ('serviceWorker' in navigator) {
    let url = process.env.PUBLIC_URL + '/sw.js';
    const reg = await navigator.serviceWorker.register(url, { scope: '/' });
    return reg;
  }
  throw Error('serviceworker not supported');
}

async function subscribe(serviceWorkerReg, subscriptionName) {
  let subscription = await serviceWorkerReg.pushManager.getSubscription();
  if (subscription === null) {
    subscription = await serviceWorkerReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.REACT_APP_PUBLIC_KEY
      //applicationServerKey: 'BOP1vbXrhHeb_sbD-2GieGRqd82oqmRg05w1t9WMz-Fk3Myi3FqmgsgsrvuRyI6r-owsIPLsK9JS-temIlRfHQc',
      // TODO: Public VAPID key should only be in .env
    });
    axios.post(`${API}/subscribe`, { subscriptionName: subscriptionName, subscription: subscription });
  }
}

async function sendNotificationToSubscriptionName(subscriptionName, notificationMessage) {
  const message = {
    subscriptionName,
    notificationMessage
  }
  return axios.post(`${API}/sendNotificationToSubscriptionName`, message);
}

async function getAllSubscriptions() {
  return axios.get(`${API}`);
}

async function checkIfAlreadySubscribed() {
  const serviceWorkerReg = await navigator.serviceWorker.getRegistration('/sw.js');
  if (!serviceWorkerReg) return false;

  let subscription = await serviceWorkerReg.pushManager.getSubscription();

  if (subscription !== null) return true;

  return false;
}

async function unregisterFromServiceWorker() {
  const serviceWorkerReg = await navigator.serviceWorker.getRegistration('/sw.js');

  if (!serviceWorkerReg) return;
  let subscription = await serviceWorkerReg.pushManager.getSubscription();

  if (!subscription) return;

  // I use the endpoint to delete a subscription. 
  // I use a non standard POST to delete the subscription in Backend
  await axios.post(`${API}/deleteByEndpoint`, { endpoint: subscription.endpoint });
  await subscription.unsubscribe();
}

export {
  regSw,
  subscribe,
  unregisterAllServiceWorkers,
  checkIfAlreadySubscribed,
  getAllSubscriptions,
  sendNotificationToSubscriptionName,
  unregisterFromServiceWorker
};