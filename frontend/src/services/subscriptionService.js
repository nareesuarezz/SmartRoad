
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

function regSw() {
  return navigator.serviceWorker.register('/sw.js');
}

async function subscribe(serviceWorkerReg, subscriptionName) {
  try {
    const subscription = await serviceWorkerReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.REACT_APP_PUBLIC_KEY
    });

    await axios.post(`${API}/subscribe`, { subscriptionName, subscription });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    throw error;
  }
}

async function unregisterFromServiceWorker() {
  try {
    const serviceWorkerReg = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!serviceWorkerReg) return;

    const subscription = await serviceWorkerReg.pushManager.getSubscription();

    if (!subscription) return;

    await axios.post(`${API}/deleteByEndpoint`, { endpoint: subscription.endpoint });
    await subscription.unsubscribe();
  } catch (error) {
    console.error('Error unregistering from push notifications:', error);
    throw error;
  }
}

export { regSw, subscribe, unregisterFromServiceWorker };
