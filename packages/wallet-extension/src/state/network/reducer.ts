import { WALLET_LOCK_SUCCESS } from '../wallet/actions';

// Network Types
export enum NetworkType {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
  CUSTOM = 'CUSTOM'
}

// Network Connection Status
export enum NetworkStatus {
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR'
}

// Network Interface
export interface Network {
  id: string;
  name: string;
  type: NetworkType;
  rpcUrl: string;
  chainId: string;
  blockExplorerUrl?: string;
  isCustom: boolean;
}

// Network State Interface
export interface NetworkState {
  networks: Record<string, Network>;
  currentNetworkId: string;
  status: NetworkStatus;
  error: string | null;
  isLoading: boolean;
  blockHeight: number;
  lastSyncTime: number;
  isCustomRpcUrlValid: boolean;
}

// Action Types
export const NETWORK_SET_CURRENT = 'NETWORK_SET_CURRENT';
export const NETWORK_ADD = 'NETWORK_ADD';
export const NETWORK_REMOVE = 'NETWORK_REMOVE';
export const NETWORK_UPDATE = 'NETWORK_UPDATE';
export const NETWORK_CONNECT = 'NETWORK_CONNECT';
export const NETWORK_CONNECT_SUCCESS = 'NETWORK_CONNECT_SUCCESS';
export const NETWORK_CONNECT_FAILURE = 'NETWORK_CONNECT_FAILURE';
export const NETWORK_DISCONNECT = 'NETWORK_DISCONNECT';
export const NETWORK_SYNC = 'NETWORK_SYNC';
export const NETWORK_SYNC_SUCCESS = 'NETWORK_SYNC_SUCCESS';
export const NETWORK_SYNC_FAILURE = 'NETWORK_SYNC_FAILURE';
export const NETWORK_VALIDATE_RPC = 'NETWORK_VALIDATE_RPC';
export const NETWORK_VALIDATE_RPC_SUCCESS = 'NETWORK_VALIDATE_RPC_SUCCESS';
export const NETWORK_VALIDATE_RPC_FAILURE = 'NETWORK_VALIDATE_RPC_FAILURE';

// Action Interfaces
interface NetworkSetCurrentAction {
  type: typeof NETWORK_SET_CURRENT;
  payload: string;
}

interface NetworkAddAction {
  type: typeof NETWORK_ADD;
  payload: Network;
}

interface NetworkRemoveAction {
  type: typeof NETWORK_REMOVE;
  payload: string;
}

interface NetworkUpdateAction {
  type: typeof NETWORK_UPDATE;
  payload: {
    id: string;
    updates: Partial<Network>;
  };
}

interface NetworkConnectAction {
  type: typeof NETWORK_CONNECT;
  payload: string;
}

interface NetworkConnectSuccessAction {
  type: typeof NETWORK_CONNECT_SUCCESS;
  payload: {
    networkId: string;
    blockHeight: number;
  };
}

interface NetworkConnectFailureAction {
  type: typeof NETWORK_CONNECT_FAILURE;
  payload: string;
}

interface NetworkDisconnectAction {
  type: typeof NETWORK_DISCONNECT;
}

interface NetworkSyncAction {
  type: typeof NETWORK_SYNC;
}

interface NetworkSyncSuccessAction {
  type: typeof NETWORK_SYNC_SUCCESS;
  payload: {
    blockHeight: number;
  };
}

interface NetworkSyncFailureAction {
  type: typeof NETWORK_SYNC_FAILURE;
  payload: string;
}

interface NetworkValidateRpcAction {
  type: typeof NETWORK_VALIDATE_RPC;
  payload: string;
}

interface NetworkValidateRpcSuccessAction {
  type: typeof NETWORK_VALIDATE_RPC_SUCCESS;
}

interface NetworkValidateRpcFailureAction {
  type: typeof NETWORK_VALIDATE_RPC_FAILURE;
  payload: string;
}

interface WalletLockSuccessAction {
  type: typeof WALLET_LOCK_SUCCESS;
}

// Union type for all network actions
export type NetworkActionTypes =
  | NetworkSetCurrentAction
  | NetworkAddAction
  | NetworkRemoveAction
  | NetworkUpdateAction
  | NetworkConnectAction
  | NetworkConnectSuccessAction
  | NetworkConnectFailureAction
  | NetworkDisconnectAction
  | NetworkSyncAction
  | NetworkSyncSuccessAction
  | NetworkSyncFailureAction
  | NetworkValidateRpcAction
  | NetworkValidateRpcSuccessAction
  | NetworkValidateRpcFailureAction
  | WalletLockSuccessAction;

// Define default networks
const defaultNetworks: Record<string, Network> = {
  mainnet: {
    id: 'mainnet',
    name: 'Aleo Mainnet',
    type: NetworkType.MAINNET,
    rpcUrl: 'https://api.aleo.network/v1',
    chainId: 'aleo:1',
    blockExplorerUrl: 'https://explorer.aleo.org',
    isCustom: false
  },
  testnet: {
    id: 'testnet',
    name: 'Aleo Testnet',
    type: NetworkType.TESTNET,
    rpcUrl: 'https://testnet-api.aleo.network/v1',
    chainId: 'aleo:2',
    blockExplorerUrl: 'https://testnet.explorer.aleo.org',
    isCustom: false
  }
};

// Initial state
const initialState: NetworkState = {
  networks: defaultNetworks,
  currentNetworkId: 'testnet', // Default to testnet for development
  status: NetworkStatus.DISCONNECTED,
  error: null,
  isLoading: false,
  blockHeight: 0,
  lastSyncTime: 0,
  isCustomRpcUrlValid: false
};

// Network reducer
const networkReducer = (
  state = initialState,
  action: NetworkActionTypes
): NetworkState => {
  switch (action.type) {
    case NETWORK_SET_CURRENT:
      return {
        ...state,
        currentNetworkId: action.payload,
        status: NetworkStatus.DISCONNECTED,
        error: null
      };
    
    case NETWORK_ADD:
      return {
        ...state,
        networks: {
          ...state.networks,
          [action.payload.id]: action.payload
        }
      };
    
    case NETWORK_REMOVE: {
      const { [action.payload]: _, ...remainingNetworks } = state.networks;
      
      // If removing the current network, switch to mainnet
      const newCurrentNetworkId = 
        action.payload === state.currentNetworkId
          ? 'mainnet'
          : state.currentNetworkId;
      
      return {
        ...state,
        networks: remainingNetworks,
        currentNetworkId: newCurrentNetworkId,
        status: 
          action.payload === state.currentNetworkId
            ? NetworkStatus.DISCONNECTED
            : state.status
      };
    }
    
    case NETWORK_UPDATE:
      return {
        ...state,
        networks: {
          ...state.networks,
          [action.payload.id]: {
            ...state.networks[action.payload.id],
            ...action.payload.updates
          }
        }
      };
    
    case NETWORK_CONNECT:
      return {
        ...state,
        status: NetworkStatus.CONNECTING,
        error: null,
        isLoading: true
      };
    
    case NETWORK_CONNECT_SUCCESS:
      return {
        ...state,
        status: NetworkStatus.CONNECTED,
        blockHeight: action.payload.blockHeight,
        lastSyncTime: Date.now(),
        error: null,
        isLoading: false
      };
    
    case NETWORK_CONNECT_FAILURE:
      return {
        ...state,
        status: NetworkStatus.ERROR,
        error: action.payload,
        isLoading: false
      };
    
    case NETWORK_DISCONNECT:
      return {
        ...state,
        status: NetworkStatus.DISCONNECTED,
        error: null
      };
    
    case NETWORK_SYNC:
      return {
        ...state,
        isLoading: true
      };
    
    case NETWORK_SYNC_SUCCESS:
      return {
        ...state,
        blockHeight: action.payload.blockHeight,
        lastSyncTime: Date.now(),
        isLoading: false
      };
    
    case NETWORK_SYNC_FAILURE:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case NETWORK_VALIDATE_RPC:
      return {
        ...state,
        isLoading: true,
        isCustomRpcUrlValid: false
      };
    
    case NETWORK_VALIDATE_RPC_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isCustomRpcUrlValid: true
      };
    
    case NETWORK_VALIDATE_RPC_FAILURE:
      return {
        ...state,
        isLoading: false,
        isCustomRpcUrlValid: false,
        error: action.payload
      };
    
    case WALLET_LOCK_SUCCESS:
      // Don't reset networks on lock, just reset connection status
      return {
        ...state,
        status: NetworkStatus.DISCONNECTED,
        error: null,
        isLoading: false
      };
    
    default:
      return state;
  }
};

export default networkReducer;