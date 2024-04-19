const axios = require('axios');
const fs = require('fs');

class Vehicle {
  constructor(id, route, backendUrl) {
    this.id = id;
    this.route = route;
    this.backendUrl = backendUrl;
  }

  async register() {
    const response = await axios.post(`${this.backendUrl}/api/vehicles`, { id: this.id });
    return response.data;
  }

  async sendTrack(track) {
    const response = await axios.post(`${this.backendUrl}/api/tracks`, { id: this.id, track });
    return response.data;
  }

  async start() {
    await this.register();

    for (let track of this.route) {
      await this.sendTrack(track);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Espera un segundo antes de enviar el siguiente track
    }
  }
}

const routes = JSON.parse(fs.readFileSync('routes.json', 'utf-8')); // Asume que tienes un archivo 'routes.json' con las rutas
const vehicles = routes.map((route, i) => new Vehicle(i, route, 'https://localhost')); 
vehicles.forEach(vehicle => vehicle.start());
