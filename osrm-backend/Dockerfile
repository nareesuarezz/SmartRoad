# Usa la imagen base de OSRM
FROM osrm/osrm-backend

# Cambia los repositorios de apt-get a la versión 'buster' de Debian
RUN sed -i 's/stretch/buster/g' /etc/apt/sources.list

# Instala curl para descargar el archivo osm.pbf
RUN apt-get update && apt-get install -y curl

# Copia el archivo PBF de Gran Canaria al contenedor
COPY canary-islands-latest.osm.pbf /osrm-data/canary-islands-latest.osm.pbf

# Descarga el módulo lib/traffic_signal
RUN mkdir -p /opt/lib && curl -o /opt/lib/traffic_signal.lua https://raw.githubusercontent.com/Project-OSRM/osrm-backend/master/profiles/lib/traffic_signal.lua

# Descarga el perfil de enrutamiento de bicicleta de OSRM
RUN curl -o /opt/foot.lua https://raw.githubusercontent.com/Project-OSRM/osrm-backend/master/profiles/foot.lua

# Prepara y construye los datos de OSRM
RUN osrm-extract -p /opt/foot.lua /osrm-data/canary-islands-latest.osm.pbf
RUN osrm-partition /osrm-data/canary-islands-latest.osrm
RUN osrm-customize /osrm-data/canary-islands-latest.osrm


# Comando para iniciar el servidor OSRM
CMD ["osrm-routed", "--algorithm", "mld", "/data/canary-islands-latest.osrm"]
