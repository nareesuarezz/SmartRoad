const axios = require('axios');
const fs = require('fs');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function getRoute(start, end) {
  const response = await axios.get(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248952c05127b6649cf90550f6f533d1058&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`);
  const coordinates = response.data.features[0].geometry.coordinates;

  // Genera puntos aleatorios a lo largo de la ruta
  const randomPoints = coordinates.map(coord => {
    const randomLat = coord[1] + Math.random() * 0.01 - 0.005; // Añade o resta hasta 0.005 grados a la latitud
    const randomLng = coord[0] + Math.random() * 0.01 - 0.005; // Añade o resta hasta 0.005 grados a la longitud
    return [randomLng, randomLat];
  });

  return randomPoints;
}


class Vehicle {
  constructor(id, type, route, backendUrl, admin_uid) {
    this.id = id;
    this.type = type;
    this.admin_uid = admin_uid;
    this.route = route;
    this.backendUrl = backendUrl;
    this.speed = Number((Math.random() * 300 + 30).toFixed(2)); // Asigna una velocidad constante al vehículo
  }

  async register() {
    const response = await axios.post(`${this.backendUrl}/api/vehicles`, { id: this.id, Vehicle: this.type, Admin_UID: '1' });
    return response;
  }

  async sendTrack(coord) {
    const track = {
      Location: { type: 'Point', coordinates: [coord[1], coord[0]] },
      Status: 'Moving',
      Speed: this.speed,
      Type: 'Simulation',
      Extra: {},
      Vehicle_UID: this.id
    };
    const response = await axios.post(`${this.backendUrl}/api/tracks`, track);
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
            const waitTime = distance / this.speed; // Correlaciona la velocidad con la distancia
            await new Promise(resolve => setTimeout(resolve, waitTime * 5000)); // Espera un tiempo proporcional a la distancia antes de moverse al siguiente punto
          }
          prevCoord = coord;
        }
      } else {
        console.log(`Failed to register vehicle ${this.id}. Status code: ${registerResponse.status}`);
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
  { "lat": 27.9847575, "lng": -15.5000564 },
  { "lat": 27.9884719, "lng": -15.3747598 },
  { "lat": 28.0840758, "lng": 15.4617254 },
  { "lat": 28.0992793, "lng": -15.471335 },
  { "lat": 28.0103162, "lng": -15.5331081 },
  { "lat": 28.1081819, "lng": -15.4217004 },
  { "lat": 28.1344405, "lng": -15.433243 },
  { "lat": 28.1097543, "lng": -15.4165598 },
  { "lat": 28.1328296, "lng": -15.4350141 },
  { "lat": 28.1585439, "lng": -15.4111716 }
];

async function generateRoutes(startIndex, endIndex) {
  const routes = [];
  const start = pointsA[startIndex];
  const end = pointsB[endIndex];
  const route = await getRoute(start, end);
  routes.push(route);
  return routes;
}

// Luego puedes llamar a esta función con los índices de los puntos que quieras usar:
generateRoutes(0, 9).then(routes => {
  // Crea vehículos y los pone en marcha
  const vehicles = routes.map((route, i) => new Vehicle(i, 'car', route, 'https://localhost'));
  vehicles.forEach(vehicle => vehicle.start());
});

