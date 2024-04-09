import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

const initialState = {
  notificationLocations: [],
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case 'ADD_LOCATION':
      return {
        ...state,
        notificationLocations: [...state.notificationLocations, action.payload],
      };
    default:
      return state;
  }
}

const persistConfig = {
  key: 'notificationLocations',
  storage,
  whitelist: ['notificationLocations'], // Solo persistir notificationLocations
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default () => {
  let store = configureStore({
    reducer: persistedReducer,
  });
  let persistor = persistStore(store);
  return { store, persistor };
};
