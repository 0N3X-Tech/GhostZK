import {
  WALLET_INIT,
  WALLET_INIT_SUCCESS,
  WALLET_INIT_FAILURE,
  WALLET_CREATE,
  WALLET_CREATE_SUCCESS,
  WALLET_CREATE_FAILURE,
  WALLET_IMPORT,
  WALLET_IMPORT_SUCCESS,
  WALLET_IMPORT_FAILURE,
  WALLET_UNLOCK,
  WALLET_UNLOCK_SUCCESS,
  WALLET_UNLOCK_FAILURE,
  WALLET_LOCK,
  WALLET_LOCK_SUCCESS,
  WALLET_ADD_ACCOUNT,
  WALLET_ADD_ACCOUNT_SUCCESS,
  WALLET_ADD_ACCOUNT_FAILURE,
  WALLET_IMPORT_ACCOUNT,
  WALLET_IMPORT_ACCOUNT_SUCCESS,
  WALLET_IMPORT_ACCOUNT_FAILURE,
  WALLET_SET_ACTIVE_ACCOUNT,
  WALLET_CHANGE_PASSWORD,
  WALLET_CHANGE_PASSWORD_SUCCESS,
  WALLET_CHANGE_PASSWORD_FAILURE,
  WalletActionTypes
} from './actions';
import { AleoAccount } from '../../services/keyring';

// Interface for wallet state
export interface WalletState {
  isInitialized: boolean;
  isUnlocked: boolean;
  isLoading: boolean;
  error: string | null;
  accounts: AleoAccount[];
  activeAccountIndex: number;
  processingAction: string | null;
}

// Initial state
const initialState: WalletState = {
  isInitialized: false,
  isUnlocked: false,
  isLoading: false,
  error: null,
  accounts: [],
  activeAccountIndex: 0,
  processingAction: null
};

// Wallet reducer
const walletReducer = (
  state = initialState,
  action: WalletActionTypes
): WalletState => {
  switch (action.type) {
    // Initialization
    case WALLET_INIT:
      return {
        ...state,
        isLoading: true,
        error: null,
        processingAction: 'init'
      };
    case WALLET_INIT_SUCCESS:
      return {
        ...state,
        isInitialized: action.payload.isInitialized,
        accounts: action.payload.accounts,
        isUnlocked: action.payload.accounts.length > 0,
        isLoading: false,
        processingAction: null
      };
    case WALLET_INIT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        processingAction: null
      };

    // Wallet creation
    case WALLET_CREATE:
      return {
        ...state,
        isLoading: true,
        error: null,
        processingAction: 'create'
      };
    case WALLET_CREATE_SUCCESS:
      return {
        ...state,
        isInitialized: true,
        isUnlocked: true,
        accounts: action.payload.accounts,
        activeAccountIndex: 0,
        isLoading: false,
        processingAction: null
      };
    case WALLET_CREATE_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        processingAction: null
      };

    // Wallet import
    case WALLET_IMPORT:
      return {
        ...state,
        isLoading: true,
        error: null,
        processingAction: 'import'
      };
    case WALLET_IMPORT_SUCCESS:
      return {
        ...state,
        isInitialized: true,
        isUnlocked: true,
        accounts: action.payload.accounts,
        activeAccountIndex: 0,
        isLoading: false,
        processingAction: null
      };
    case WALLET_IMPORT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        processingAction: null
      };

    // Wallet unlock
    case WALLET_UNLOCK:
      return {
        ...state,
        isLoading: true,
        error: null,
        processingAction: 'unlock'
      };
    case WALLET_UNLOCK_SUCCESS:
      return {
        ...state,
        isUnlocked: true,
        accounts: action.payload.accounts,
        isLoading: false,
        processingAction: null
      };
    case WALLET_UNLOCK_FAILURE:
      return {
        ...state,
        isUnlocked: false,
        isLoading: false,
        error: action.payload,
        processingAction: null
      };

    // Wallet lock
    case WALLET_LOCK:
      return {
        ...state,
        isLoading: true,
        processingAction: 'lock'
      };
    case WALLET_LOCK_SUCCESS:
      return {
        ...state,
        isUnlocked: false,
        accounts: [],
        isLoading: false,
        processingAction: null
      };

    // Account creation
    case WALLET_ADD_ACCOUNT:
      return {
        ...state,
        isLoading: true,
        error: null,
        processingAction: 'addAccount'
      };
    case WALLET_ADD_ACCOUNT_SUCCESS:
      return {
        ...state,
        accounts: [...state.accounts, action.payload],
        activeAccountIndex: state.accounts.length,
        isLoading: false,
        processingAction: null
      };
    case WALLET_ADD_ACCOUNT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        processingAction: null
      };

    // Account import
    case WALLET_IMPORT_ACCOUNT:
      return {
        ...state,
        isLoading: true,
        error: null,
        processingAction: 'importAccount'
      };
    case WALLET_IMPORT_ACCOUNT_SUCCESS:
      return {
        ...state,
        accounts: [...state.accounts, action.payload],
        activeAccountIndex: state.accounts.length,
        isLoading: false,
        processingAction: null
      };
    case WALLET_IMPORT_ACCOUNT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        processingAction: null
      };

    // Set active account
    case WALLET_SET_ACTIVE_ACCOUNT:
      return {
        ...state,
        activeAccountIndex: action.payload
      };

    // Change password
    case WALLET_CHANGE_PASSWORD:
      return {
        ...state,
        isLoading: true,
        error: null,
        processingAction: 'changePassword'
      };
    case WALLET_CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        isLoading: false,
        processingAction: null
      };
    case WALLET_CHANGE_PASSWORD_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        processingAction: null
      };

    default:
      return state;
  }
};

export default walletReducer;