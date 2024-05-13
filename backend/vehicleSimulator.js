const axios = require('axios');
const fs = require('fs');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function getRoute(start, end) {
  const response = await axios.get(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248952c05127b6649cf90550f6f533d1058&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`);
  return response.data.features[0].geometry.coordinates;
}

class Vehicle {
  constructor(id, type, route, backendUrl, admin_uid) {
    this.id = id;
    this.type = type;
    this.admin_uid = admin_uid;
    this.route = route;
    this.backendUrl = backendUrl;
  }

  async register() {
    const response = await axios.post(`${this.backendUrl}/api/vehicles`, { id: this.id, Vehicle: this.type, Admin_UID: '1' });
    return response;
  }

  async sendTrack(coord) {
    const speed = Math.random() * 100;
    const track = {
      Location: { type: 'Point', coordinates: [coord[1], coord[0]] },
      Status: 'Moving',
      Speed: speed,
      Type: 'Simulation',
      Extra: {},
      Vehicle_UID: this.id
    };
    const response = await axios.post(`${this.backendUrl}/api/tracks`, track);
    console.log(track.Speed + " " + track.Type)
    return response.data;
  }

  async start() {
    try {
      const registerResponse = await this.register();
      if (registerResponse.status === 200) { // Asegúrate de que el registro fue exitoso
        let prevCoord = null;
        for (let coord of this.route) {
          console.log(`Vehicle ${this.id} is at ${coord}`);
          const trackResponse = await this.sendTrack(coord);
          if (prevCoord) {
            const distance = Math.sqrt(Math.pow(prevCoord[0] - coord[0], 2) + Math.pow(prevCoord[1] - coord[1], 2)); // Calcula la distancia euclidiana
            const waitTime = distance / trackResponse.Speed; // Correlaciona la velocidad con la distancia
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000)); // Espera un tiempo proporcional a la distancia antes de moverse al siguiente punto
          }
          prevCoord = coord;
        }
      } else {
        console.log(registerResponse.status)
        console.log(`Failed to register vehicle ${this.id}`);
      }
    } catch (error) {
      console.error(`Error starting vehicle ${this.id}:`, error);
    }
  }

}

const points = [
  { "lat": 28.110756, "lng": -15.417017 },
  { "lat": 28.113245, "lng": -15.421044 },
  { "lat": 28.120454, "lng": -15.427277 },
  { "lat": 28.099948, "lng": -15.414738 },
  { "lat": 28.099682, "lng": -15.413845 },
  { "lat": 28.115895, "lng": -15.430131 },
  { "lat": 28.129989, "lng": -15.431374 },
  { "lat": 28.131776, "lng": -15.442561 },
  { "lat": 28.126433, "lng": -15.446464 },
  { "lat": 28.127864, "lng": -15.446545 }
];

async function generateRoutes() {
  const routes = [];
  for (let i = 0; i < Math.min(points.length - 1, 20); i++) { // Limita la creación de rutas a 20
    const route = await getRoute(points[i], points[i + 1]);
    routes.push(route);
  }
  return routes;
}


generateRoutes().then(routes => {
  // Crea vehículos y los pone en marcha
  const vehicles = routes.map((route, i) => new Vehicle(i, 'car', route, 'https://localhost'));
  vehicles.forEach(vehicle => vehicle.start());
});
