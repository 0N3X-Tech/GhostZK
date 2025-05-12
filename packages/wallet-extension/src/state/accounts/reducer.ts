import {
  WALLET_ADD_ACCOUNT_SUCCESS,
  WALLET_IMPORT_ACCOUNT_SUCCESS,
  WALLET_UNLOCK_SUCCESS,
  WALLET_LOCK_SUCCESS,
  WALLET_CREATE_SUCCESS,
  WALLET_IMPORT_SUCCESS
} from '../wallet/actions';
import { AleoAccount } from '../../services/keyring';

// Action Types
export const ACCOUNTS_FETCH_BALANCES = 'ACCOUNTS_FETCH_BALANCES';
export const ACCOUNTS_FETCH_BALANCES_SUCCESS = 'ACCOUNTS_FETCH_BALANCES_SUCCESS';
export const ACCOUNTS_FETCH_BALANCES_FAILURE = 'ACCOUNTS_FETCH_BALANCES_FAILURE';
export const ACCOUNTS_UPDATE_BALANCE = 'ACCOUNTS_UPDATE_BALANCE';
export const ACCOUNTS_REFRESH_TOKENS = 'ACCOUNTS_REFRESH_TOKENS';
export const ACCOUNTS_REFRESH_TOKENS_SUCCESS = 'ACCOUNTS_REFRESH_TOKENS_SUCCESS';
export const ACCOUNTS_REFRESH_TOKENS_FAILURE = 'ACCOUNTS_REFRESH_TOKENS_FAILURE';

// Token record interface (simplified representation of private Aleo token)
export interface TokenRecord {
  id: string;
  owner: string;
  amount: string;
  programId: string;
  recordData: string;
  spent: boolean;
}

// Balance information interface
export interface AccountBalance {
  address: string;
  publicBalance: string;
  privateBalance: string;
  tokens: TokenRecord[];
  lastUpdated: number;
}

// Account state interface
export interface AccountsState {
  balances: { [address: string]: AccountBalance };
  isLoading: boolean;
  error: string | null;
}

// Action interfaces
interface FetchBalancesAction {
  type: typeof ACCOUNTS_FETCH_BALANCES;
  payload: string[];
}

interface FetchBalancesSuccessAction {
  type: typeof ACCOUNTS_FETCH_BALANCES_SUCCESS;
  payload: { [address: string]: AccountBalance };
}

interface FetchBalancesFailureAction {
  type: typeof ACCOUNTS_FETCH_BALANCES_FAILURE;
  payload: string;
}

interface UpdateBalanceAction {
  type: typeof ACCOUNTS_UPDATE_BALANCE;
  payload: AccountBalance;
}

interface RefreshTokensAction {
  type: typeof ACCOUNTS_REFRESH_TOKENS;
  payload: string;
}

interface RefreshTokensSuccessAction {
  type: typeof ACCOUNTS_REFRESH_TOKENS_SUCCESS;
  payload: {
    address: string;
    tokens: TokenRecord[];
  };
}

interface RefreshTokensFailureAction {
  type: typeof ACCOUNTS_REFRESH_TOKENS_FAILURE;
  payload: {
    address: string;
    error: string;
  };
}

// Union type for all account actions
export type AccountsActionTypes =
  | FetchBalancesAction
  | FetchBalancesSuccessAction
  | FetchBalancesFailureAction
  | UpdateBalanceAction
  | RefreshTokensAction
  | RefreshTokensSuccessAction
  | RefreshTokensFailureAction
  | { type: typeof WALLET_ADD_ACCOUNT_SUCCESS; payload: AleoAccount }
  | { type: typeof WALLET_IMPORT_ACCOUNT_SUCCESS; payload: AleoAccount }
  | { type: typeof WALLET_UNLOCK_SUCCESS; payload: { accounts: AleoAccount[] } }
  | { type: typeof WALLET_LOCK_SUCCESS }
  | { type: typeof WALLET_CREATE_SUCCESS; payload: { accounts: AleoAccount[] } }
  | { type: typeof WALLET_IMPORT_SUCCESS; payload: { accounts: AleoAccount[] } };

// Initial state
const initialState: AccountsState = {
  balances: {},
  isLoading: false,
  error: null
};

// Create empty balance for an address
const createEmptyBalance = (address: string): AccountBalance => ({
  address,
  publicBalance: '0',
  privateBalance: '0',
  tokens: [],
  lastUpdated: Date.now()
});

// Accounts reducer
const accountsReducer = (
  state = initialState,
  action: AccountsActionTypes
): AccountsState => {
  switch (action.type) {
    case ACCOUNTS_FETCH_BALANCES:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case ACCOUNTS_FETCH_BALANCES_SUCCESS:
      return {
        ...state,
        balances: {
          ...state.balances,
          ...action.payload
        },
        isLoading: false
      };

    case ACCOUNTS_FETCH_BALANCES_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case ACCOUNTS_UPDATE_BALANCE:
      return {
        ...state,
        balances: {
          ...state.balances,
          [action.payload.address]: action.payload
        }
      };

    case ACCOUNTS_REFRESH_TOKENS:
      return {
        ...state,
        isLoading: true
      };

    case ACCOUNTS_REFRESH_TOKENS_SUCCESS:
      return {
        ...state,
        balances: {
          ...state.balances,
          [action.payload.address]: {
            ...state.balances[action.payload.address],
            tokens: action.payload.tokens,
            lastUpdated: Date.now()
          }
        },
        isLoading: false
      };

    case ACCOUNTS_REFRESH_TOKENS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error
      };

    // When a new account is added, initialize its balance
    case WALLET_ADD_ACCOUNT_SUCCESS:
    case WALLET_IMPORT_ACCOUNT_SUCCESS:
      return {
        ...state,
        balances: {
          ...state.balances,
          [action.payload.address]: createEmptyBalance(action.payload.address)
        }
      };

    // When wallet is unlocked, initialize balances for all accounts
    case WALLET_UNLOCK_SUCCESS:
    case WALLET_CREATE_SUCCESS:
    case WALLET_IMPORT_SUCCESS: {
      const newBalances = { ...state.balances };
      action.payload.accounts.forEach(account => {
        if (!newBalances[account.address]) {
          newBalances[account.address] = createEmptyBalance(account.address);
        }
      });
      return {
        ...state,
        balances: newBalances
      };
    }

    // When wallet is locked, clear all state
    case WALLET_LOCK_SUCCESS:
      return initialState;

    default:
      return state;
  }
};

export default accountsReducer;