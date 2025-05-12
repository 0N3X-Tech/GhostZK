import { createStore, combineReducers, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import thunk from 'redux-thunk';
import storage from 'redux-persist/lib/storage';

// Import reducers
import walletReducer from './wallet/reducer';
import accountsReducer from './accounts/reducer';
import transactionsReducer from './transactions/reducer';
import networkReducer from './network/reducer';
import settingsReducer from './settings/reducer';
import dappReducer from './dapp/reducer';

// Root reducer configuration
const rootReducer = combineReducers({
  wallet: walletReducer,
  accounts: accountsReducer,
  transactions: transactionsReducer,
  network: networkReducer,
  settings: settingsReducer,
  dapp: dappReducer
});

// Configure persistence
const persistConfig = {
  key: 'ghostzk-root',
  storage,
  // Don't persist sensitive data or UI state
  blacklist: ['dapp'],
  // Configure nested persisted reducers
  whitelist: ['wallet', 'accounts', 'transactions', 'network', 'settings']
};

// Create the persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store with middleware
export const store = createStore(
  persistedReducer,
  applyMiddleware(thunk)
);

// Create the persistor
export const persistor = persistStore(store);

// Define types for TypeScript
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;