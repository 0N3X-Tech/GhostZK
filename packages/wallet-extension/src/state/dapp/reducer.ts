import { WALLET_LOCK_SUCCESS } from '../wallet/actions';

// DApp Permission types
export enum DAppPermission {
  CONNECT = 'CONNECT',
  VIEW_ACCOUNT = 'VIEW_ACCOUNT',
  SIGN_TRANSACTION = 'SIGN_TRANSACTION',
  SUGGEST_TRANSACTION = 'SUGGEST_TRANSACTION',
  AUTO_APPROVE_TRANSACTION = 'AUTO_APPROVE_TRANSACTION',
  VIEW_BALANCE = 'VIEW_BALANCE',
  ACCESS_RECORDS = 'ACCESS_RECORDS'
}

// DApp Connection Status
export enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

// DApp Interface
export interface DApp {
  id: string;
  name: string;
  url: string;
  icon?: string;
  description?: string;
  permissions: DAppPermission[];
  status: ConnectionStatus;
  connectedAt: number;
  lastActive: number;
  origin: string;
}

// Connection Request Interface
export interface ConnectionRequest {
  id: string;
  name: string;
  url: string;
  icon?: string;
  description?: string;
  requestedPermissions: DAppPermission[];
  origin: string;
  timestamp: number;
}

// DApp State Interface
export interface DAppState {
  connectedDApps: Record<string, DApp>;
  connectionRequests: Record<string, ConnectionRequest>;
  activeConnections: string[];
  activeRequest: string | null;
  isConnecting: boolean;
  error: string | null;
}

// Action Types
export const DAPP_CONNECTION_REQUEST = 'DAPP_CONNECTION_REQUEST';
export const DAPP_CONNECTION_APPROVE = 'DAPP_CONNECTION_APPROVE';
export const DAPP_CONNECTION_REJECT = 'DAPP_CONNECTION_REJECT';
export const DAPP_DISCONNECT = 'DAPP_DISCONNECT';
export const DAPP_SET_ACTIVE_REQUEST = 'DAPP_SET_ACTIVE_REQUEST';
export const DAPP_CLEAR_ACTIVE_REQUEST = 'DAPP_CLEAR_ACTIVE_REQUEST';
export const DAPP_UPDATE_PERMISSIONS = 'DAPP_UPDATE_PERMISSIONS';
export const DAPP_UPDATE_LAST_ACTIVE = 'DAPP_UPDATE_LAST_ACTIVE';
export const DAPP_CLEAR_ALL_CONNECTIONS = 'DAPP_CLEAR_ALL_CONNECTIONS';
export const DAPP_CONNECTION_ERROR = 'DAPP_CONNECTION_ERROR';

// Action Interfaces
interface DAppConnectionRequestAction {
  type: typeof DAPP_CONNECTION_REQUEST;
  payload: ConnectionRequest;
}

interface DAppConnectionApproveAction {
  type: typeof DAPP_CONNECTION_APPROVE;
  payload: {
    requestId: string;
    approvedPermissions: DAppPermission[];
  };
}

interface DAppConnectionRejectAction {
  type: typeof DAPP_CONNECTION_REJECT;
  payload: string; // requestId
}

interface DAppDisconnectAction {
  type: typeof DAPP_DISCONNECT;
  payload: string; // dappId
}

interface DAppSetActiveRequestAction {
  type: typeof DAPP_SET_ACTIVE_REQUEST;
  payload: string; // requestId
}

interface DAppClearActiveRequestAction {
  type: typeof DAPP_CLEAR_ACTIVE_REQUEST;
}

interface DAppUpdatePermissionsAction {
  type: typeof DAPP_UPDATE_PERMISSIONS;
  payload: {
    dappId: string;
    permissions: DAppPermission[];
  };
}

interface DAppUpdateLastActiveAction {
  type: typeof DAPP_UPDATE_LAST_ACTIVE;
  payload: string; // dappId
}

interface DAppClearAllConnectionsAction {
  type: typeof DAPP_CLEAR_ALL_CONNECTIONS;
}

interface DAppConnectionErrorAction {
  type: typeof DAPP_CONNECTION_ERROR;
  payload: string; // error message
}

interface WalletLockSuccessAction {
  type: typeof WALLET_LOCK_SUCCESS;
}

// Union type for all dapp actions
export type DAppActionTypes =
  | DAppConnectionRequestAction
  | DAppConnectionApproveAction
  | DAppConnectionRejectAction
  | DAppDisconnectAction
  | DAppSetActiveRequestAction
  | DAppClearActiveRequestAction
  | DAppUpdatePermissionsAction
  | DAppUpdateLastActiveAction
  | DAppClearAllConnectionsAction
  | DAppConnectionErrorAction
  | WalletLockSuccessAction;

// Initial state
const initialState: DAppState = {
  connectedDApps: {},
  connectionRequests: {},
  activeConnections: [],
  activeRequest: null,
  isConnecting: false,
  error: null
};

// DApp reducer
const dappReducer = (
  state = initialState,
  action: DAppActionTypes
): DAppState => {
  switch (action.type) {
    case DAPP_CONNECTION_REQUEST:
      return {
        ...state,
        connectionRequests: {
          ...state.connectionRequests,
          [action.payload.id]: action.payload
        },
        isConnecting: true,
        error: null
      };
    
    case DAPP_CONNECTION_APPROVE: {
      const { requestId, approvedPermissions } = action.payload;
      const request = state.connectionRequests[requestId];
      
      if (!request) {
        return state;
      }
      
      // Create the new DApp connection
      const newDApp: DApp = {
        id: request.id,
        name: request.name,
        url: request.url,
        icon: request.icon,
        description: request.description,
        permissions: approvedPermissions,
        status: ConnectionStatus.CONNECTED,
        connectedAt: Date.now(),
        lastActive: Date.now(),
        origin: request.origin
      };
      
      // Remove the connection request
      const { [requestId]: _, ...remainingRequests } = state.connectionRequests;
      
      return {
        ...state,
        connectedDApps: {
          ...state.connectedDApps,
          [newDApp.id]: newDApp
        },
        connectionRequests: remainingRequests,
        activeConnections: [...state.activeConnections, newDApp.id],
        activeRequest: null,
        isConnecting: false
      };
    }
    
    case DAPP_CONNECTION_REJECT: {
      const requestId = action.payload;
      
      // Remove the connection request
      const { [requestId]: _, ...remainingRequests } = state.connectionRequests;
      
      return {
        ...state,
        connectionRequests: remainingRequests,
        activeRequest: state.activeRequest === requestId ? null : state.activeRequest,
        isConnecting: false
      };
    }
    
    case DAPP_DISCONNECT: {
      const dappId = action.payload;
      
      // Remove the dApp from connected dApps
      const { [dappId]: _, ...remainingDApps } = state.connectedDApps;
      
      return {
        ...state,
        connectedDApps: remainingDApps,
        activeConnections: state.activeConnections.filter(id => id !== dappId)
      };
    }
    
    case DAPP_SET_ACTIVE_REQUEST:
      return {
        ...state,
        activeRequest: action.payload
      };
    
    case DAPP_CLEAR_ACTIVE_REQUEST:
      return {
        ...state,
        activeRequest: null
      };
    
    case DAPP_UPDATE_PERMISSIONS: {
      const { dappId, permissions } = action.payload;
      const dapp = state.connectedDApps[dappId];
      
      if (!dapp) {
        return state;
      }
      
      return {
        ...state,
        connectedDApps: {
          ...state.connectedDApps,
          [dappId]: {
            ...dapp,
            permissions
          }
        }
      };
    }
    
    case DAPP_UPDATE_LAST_ACTIVE: {
      const dappId = action.payload;
      const dapp = state.connectedDApps[dappId];
      
      if (!dapp) {
        return state;
      }
      
      return {
        ...state,
        connectedDApps: {
          ...state.connectedDApps,
          [dappId]: {
            ...dapp,
            lastActive: Date.now()
          }
        }
      };
    }
    
    case DAPP_CLEAR_ALL_CONNECTIONS:
      return {
        ...state,
        connectedDApps: {},
        activeConnections: [],
        connectionRequests: {},
        activeRequest: null
      };
    
    case DAPP_CONNECTION_ERROR:
      return {
        ...state,
        error: action.payload,
        isConnecting: false
      };
    
    case WALLET_LOCK_SUCCESS:
      // Clear active requests but keep connection history
      return {
        ...state,
        connectionRequests: {},
        activeRequest: null,
        isConnecting: false
      };
    
    default:
      return state;
  }
};

export default dappReducer;