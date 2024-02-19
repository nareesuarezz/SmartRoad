// intl.js
import { createIntl, createIntlCache } from 'react-intl';

// Define los mensajes para cada idioma
const messages = {
  en: {
    greeting: 'Hello!',
  },
  es: {
    greeting: '¡Hola!',
  },
};

// Configura el sistema de cache de react-intl
const cache = createIntlCache();

// Crea una instancia de `intl` con mensajes y cache
const intl = createIntl({ locale: 'en', messages }, cache);

export default intl;
