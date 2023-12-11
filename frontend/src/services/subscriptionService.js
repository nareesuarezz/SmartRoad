import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const publicKey = process.env.REACT_APP_PUBLIC_KEY;
const key = urlBase64ToUint8Array(publicKey);
console.log(key.length);  
console.log(key[0]);  



async function regSw() {
    return navigator.serviceWorker.register('/sw.js');
}

async function subscribe(serviceWorkerReg, subscriptionName) {
  try {
      const existingSubscription = await serviceWorkerReg.pushManager.getSubscription();
      if (existingSubscription) {
          await existingSubscription.unsubscribe();
      }

      const applicationServerKey = urlBase64ToUint8Array(publicKey); 

      const subscription = await serviceWorkerReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey, 
      });

      await axios.post(`${API}/subscribe`, { subscriptionName, subscription });
  } catch (error) {
      console.error('Error al suscribirse a las notificaciones push:', error);
      throw error;
  }
}


async function unregisterFromServiceWorker() {
    try {
        const serviceWorkerReg = await navigator.serviceWorker.getRegistration('../sw.js');
        if (!serviceWorkerReg) return;

        const subscription = await serviceWorkerReg.pushManager.getSubscription();

        if (!subscription) return;

        await axios.post(`${API}/deleteByEndpoint`, { endpoint: subscription.endpoint });
        await subscription.unsubscribe();
    } catch (error) {
        console.error('Error al anular la suscripción a las notificaciones push:', error);
        throw error;
    }
}

export { regSw, subscribe, unregisterFromServiceWorker };
