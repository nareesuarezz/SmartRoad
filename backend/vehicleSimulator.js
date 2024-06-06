const axios = require('axios');
const fs = require('fs');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const time = 5;

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

  async sendTrack(coord, speed) {
    const track = {
      Location: { type: 'Point', coordinates: [coord[1], coord[0]] },
      Status: 'Moving',
      Speed: speed,
      Type: 'Simulation',
      Extra: {},
      Vehicle_UID: this.id
    };
    const response = await axios.post(`${this.backendUrl}/api/tracks`, track);
    return response.data;
  }

  calculateDistance(coord1, coord2) {
    const R = 6371e3; // Radio medio de la tierra en metros
    const lat1 = coord1[1] * Math.PI / 180; // Convertir a radianes
    const lat2 = coord2[1] * Math.PI / 180;
    const deltaLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const deltaLng = (coord2[0] - coord1[0]) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  }

  calculateSpeed(distance, time) {
    const speedInMetersPerSecond = distance / time; // Velocidad en m/s
    const speedInKmH = speedInMetersPerSecond * 3.6;
    return speedInKmH
  }

  async start() {
    try {
      const registerResponse = await this.register();
      if (registerResponse.status === 200) { // Asegúrate de que el registro fue exitoso
        let prevCoord;
        for (let coord of this.route) {
          console.log(`Vehicle ${this.id} is at ${coord}`);
          if (prevCoord) {
            const distance = this.calculateDistance(prevCoord, coord);
            const speed = this.calculateSpeed(distance, time); // 5 segundos entre cada punto
            await this.sendTrack(coord, speed);
          } else {
            await this.sendTrack(coord, 1); // Velocidad inicial es 0
          }
          prevCoord = coord;
          await new Promise(resolve => setTimeout(resolve, 5000));
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

const pointsA = [
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

const pointsB = [
  { "lat": 28.1151673, "lng": -15.4357038 },
  { "lat": 28.1327237, "lng": -15.4322041 },
  { "lat": 28.0947911, "lng": -15.4464587 },
  { "lat": 28.0859946, "lng": -15.4324199 },
  { "lat": 28.0979849, "lng": -15.422047 },
  { "lat": 28.0831454, "lng": -15.442992 },
  { "lat": 28.0992793, "lng": -15.471335 },
  { "lat": 28.1047834, "lng": -15.5635292 },
  { "lat": 28.0457739, "lng": -15.4776423 },
  { "lat": 27.9387428, "lng": -15.3896664 }
];

async function generateRoutes() {
  const routes = [];
  for (let i = 0; i < Math.min(pointsA.length, pointsB.length, 20); i++) { // Limita la creación de rutas a 20
    // Genera una ruta desde el puntoA hasta un puntoB
    const route = await getRoute(pointsA[i], pointsB[i]);
    routes.push(route);
  }
  return routes;
}

generateRoutes().then(routes => {
  // Crea vehículos y los pone en marcha
  const vehicles = routes.map((route, i) => new Vehicle(i, 'car', route, 'https://localhost'));
  vehicles.forEach(vehicle => vehicle.start());
});