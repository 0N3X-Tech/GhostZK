import { Dispatch } from 'redux';
import Keyring, { AleoAccount } from '../../services/keyring';

// Action Types
export const WALLET_INIT = 'WALLET_INIT';
export const WALLET_INIT_SUCCESS = 'WALLET_INIT_SUCCESS';
export const WALLET_INIT_FAILURE = 'WALLET_INIT_FAILURE';
export const WALLET_CREATE = 'WALLET_CREATE';
export const WALLET_CREATE_SUCCESS = 'WALLET_CREATE_SUCCESS';
export const WALLET_CREATE_FAILURE = 'WALLET_CREATE_FAILURE';
export const WALLET_IMPORT = 'WALLET_IMPORT';
export const WALLET_IMPORT_SUCCESS = 'WALLET_IMPORT_SUCCESS';
export const WALLET_IMPORT_FAILURE = 'WALLET_IMPORT_FAILURE';
export const WALLET_UNLOCK = 'WALLET_UNLOCK';
export const WALLET_UNLOCK_SUCCESS = 'WALLET_UNLOCK_SUCCESS';
export const WALLET_UNLOCK_FAILURE = 'WALLET_UNLOCK_FAILURE';
export const WALLET_LOCK = 'WALLET_LOCK';
export const WALLET_LOCK_SUCCESS = 'WALLET_LOCK_SUCCESS';
export const WALLET_ADD_ACCOUNT = 'WALLET_ADD_ACCOUNT';
export const WALLET_ADD_ACCOUNT_SUCCESS = 'WALLET_ADD_ACCOUNT_SUCCESS';
export const WALLET_ADD_ACCOUNT_FAILURE = 'WALLET_ADD_ACCOUNT_FAILURE';
export const WALLET_IMPORT_ACCOUNT = 'WALLET_IMPORT_ACCOUNT';
export const WALLET_IMPORT_ACCOUNT_SUCCESS = 'WALLET_IMPORT_ACCOUNT_SUCCESS';
export const WALLET_IMPORT_ACCOUNT_FAILURE = 'WALLET_IMPORT_ACCOUNT_FAILURE';
export const WALLET_SET_ACTIVE_ACCOUNT = 'WALLET_SET_ACTIVE_ACCOUNT';
export const WALLET_CHANGE_PASSWORD = 'WALLET_CHANGE_PASSWORD';
export const WALLET_CHANGE_PASSWORD_SUCCESS = 'WALLET_CHANGE_PASSWORD_SUCCESS';
export const WALLET_CHANGE_PASSWORD_FAILURE = 'WALLET_CHANGE_PASSWORD_FAILURE';

// Interface definitions for actions
interface WalletInitAction {
  type: typeof WALLET_INIT;
}

interface WalletInitSuccessAction {
  type: typeof WALLET_INIT_SUCCESS;
  payload: {
    isInitialized: boolean;
    accounts: AleoAccount[];
  };
}

interface WalletInitFailureAction {
  type: typeof WALLET_INIT_FAILURE;
  payload: string;
}

interface WalletCreateAction {
  type: typeof WALLET_CREATE;
}

interface WalletCreateSuccessAction {
  type: typeof WALLET_CREATE_SUCCESS;
  payload: {
    accounts: AleoAccount[];
  };
}

interface WalletCreateFailureAction {
  type: typeof WALLET_CREATE_FAILURE;
  payload: string;
}

interface WalletImportAction {
  type: typeof WALLET_IMPORT;
}

interface WalletImportSuccessAction {
  type: typeof WALLET_IMPORT_SUCCESS;
  payload: {
    accounts: AleoAccount[];
  };
}

interface WalletImportFailureAction {
  type: typeof WALLET_IMPORT_FAILURE;
  payload: string;
}

interface WalletUnlockAction {
  type: typeof WALLET_UNLOCK;
}

interface WalletUnlockSuccessAction {
  type: typeof WALLET_UNLOCK_SUCCESS;
  payload: {
    accounts: AleoAccount[];
  };
}

interface WalletUnlockFailureAction {
  type: typeof WALLET_UNLOCK_FAILURE;
  payload: string;
}

interface WalletLockAction {
  type: typeof WALLET_LOCK;
}

interface WalletLockSuccessAction {
  type: typeof WALLET_LOCK_SUCCESS;
}

interface WalletAddAccountAction {
  type: typeof WALLET_ADD_ACCOUNT;
}

interface WalletAddAccountSuccessAction {
  type: typeof WALLET_ADD_ACCOUNT_SUCCESS;
  payload: AleoAccount;
}

interface WalletAddAccountFailureAction {
  type: typeof WALLET_ADD_ACCOUNT_FAILURE;
  payload: string;
}

interface WalletImportAccountAction {
  type: typeof WALLET_IMPORT_ACCOUNT;
}

interface WalletImportAccountSuccessAction {
  type: typeof WALLET_IMPORT_ACCOUNT_SUCCESS;
  payload: AleoAccount;
}

interface WalletImportAccountFailureAction {
  type: typeof WALLET_IMPORT_ACCOUNT_FAILURE;
  payload: string;
}

interface WalletSetActiveAccountAction {
  type: typeof WALLET_SET_ACTIVE_ACCOUNT;
  payload: number;
}

interface WalletChangePasswordAction {
  type: typeof WALLET_CHANGE_PASSWORD;
}

interface WalletChangePasswordSuccessAction {
  type: typeof WALLET_CHANGE_PASSWORD_SUCCESS;
}

interface WalletChangePasswordFailureAction {
  type: typeof WALLET_CHANGE_PASSWORD_FAILURE;
  payload: string;
}

// Union type for all wallet actions
export type WalletActionTypes =
  | WalletInitAction
  | WalletInitSuccessAction
  | WalletInitFailureAction
  | WalletCreateAction
  | WalletCreateSuccessAction
  | WalletCreateFailureAction
  | WalletImportAction
  | WalletImportSuccessAction
  | WalletImportFailureAction
  | WalletUnlockAction
  | WalletUnlockSuccessAction
  | WalletUnlockFailureAction
  | WalletLockAction
  | WalletLockSuccessAction
  | WalletAddAccountAction
  | WalletAddAccountSuccessAction
  | WalletAddAccountFailureAction
  | WalletImportAccountAction
  | WalletImportAccountSuccessAction
  | WalletImportAccountFailureAction
  | WalletSetActiveAccountAction
  | WalletChangePasswordAction
  | WalletChangePasswordSuccessAction
  | WalletChangePasswordFailureAction;

// Create a keyring instance
const keyring = new Keyring();

// Action creators
export const initializeWallet = () => {
  return async (dispatch: Dispatch<WalletActionTypes>) => {
    dispatch({ type: WALLET_INIT });

    try {
      // Initialize the keyring and proof engine
      await keyring.initialize();
      
      // Check if wallet is initialized
      const isInitialized = await keyring.isInitialized();
      
      // If wallet is initialized and unlocked, get accounts
      const accounts = keyring.isUnlocked() ? keyring.getAccounts() : [];
      
      dispatch({
        type: WALLET_INIT_SUCCESS,
        payload: { isInitialized, accounts }
      });
      
      return isInitialized;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize wallet';
      dispatch({
        type: WALLET_INIT_FAILURE,
        payload: errorMessage
      });
      
      throw error;
    }
  };
};

export const createWallet = (password: string, wordCount: 12 | 15 | 18 | 21 | 24 = 24) => {
  return async (dispatch: Dispatch<WalletActionTypes>) => {
    dispatch({ type: WALLET_CREATE });

    try {
      // Create a new wallet
      await keyring.createNewWallet(password, wordCount);
      
      // Get the accounts
      const accounts = keyring.getAccounts();
      
      dispatch({
        type: WALLET_CREATE_SUCCESS,
        payload: { accounts }
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create wallet';
      dispatch({
        type: WALLET_CREATE_FAILURE,
        payload: errorMessage
      });
      
      throw error;
    }
  };
};

export const importWallet = (mnemonic: string, password: string) => {
  return async (dispatch: Dispatch<WalletActionTypes>) => {
    dispatch({ type: WALLET_IMPORT });

    try {
      // Restore wallet from mnemonic
      await keyring.restoreFromMnemonic(mnemonic, password);
      
      // Get the accounts
      const accounts = keyring.getAccounts();
      
      dispatch({
        type: WALLET_IMPORT_SUCCESS,
        payload: { accounts }
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import wallet';
      dispatch({
        type: WALLET_IMPORT_FAILURE,
        payload: errorMessage
      });
      
      throw error;
    }
  };
};

export const unlockWallet = (password: string) => {
  return async (dispatch: Dispatch<WalletActionTypes>) => {
    dispatch({ type: WALLET_UNLOCK });

    try {
      // Unlock the wallet
      const success = await keyring.unlock(password);
      
      if (!success) {
        throw new Error('Invalid password');
      }
      
      // Get the accounts
      const accounts = keyring.getAccounts();
      
      dispatch({
        type: WALLET_UNLOCK_SUCCESS,
        payload: { accounts }
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unlock wallet';
      dispatch({
        type: WALLET_UNLOCK_FAILURE,
        payload: errorMessage
      });
      
      return false;
    }
  };
};

export const lockWallet = () => {
  return (dispatch: Dispatch<WalletActionTypes>) => {
    // Lock the wallet
    keyring.lock();
    
    dispatch({ type: WALLET_LOCK });
    dispatch({ type: WALLET_LOCK_SUCCESS });
    
    return true;
  };
};

export const addAccount = (name: string) => {
  return async (dispatch: Dispatch<WalletActionTypes>) => {
    dispatch({ type: WALLET_ADD_ACCOUNT });

    try {
      // Add a new account
      const account = await keyring.addAccount(name);
      
      dispatch({
        type: WALLET_ADD_ACCOUNT_SUCCESS,
        payload: account
      });
      
      return account;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add account';
      dispatch({
        type: WALLET_ADD_ACCOUNT_FAILURE,
        payload: errorMessage
      });
      
      throw error;
    }
  };
};

export const importAccount = (privateKey: string, name: string) => {
  return async (dispatch: Dispatch<WalletActionTypes>) => {
    dispatch({ type: WALLET_IMPORT_ACCOUNT });

    try {
      // Import an account
      const account = await keyring.importPrivateKey(privateKey, name);
      
      dispatch({
        type: WALLET_IMPORT_ACCOUNT_SUCCESS,
        payload: account
      });
      
      return account;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import account';
      dispatch({
        type: WALLET_IMPORT_ACCOUNT_FAILURE,
        payload: errorMessage
      });
      
      throw error;
    }
  };
};

export const setActiveAccount = (index: number) => {
  return {
    type: WALLET_SET_ACTIVE_ACCOUNT,
    payload: index
  };
};

export const changePassword = (currentPassword: string, newPassword: string) => {
  return async (dispatch: Dispatch<WalletActionTypes>) => {
    dispatch({ type: WALLET_CHANGE_PASSWORD });

    try {
      // Change the password
      await keyring.changePassword(currentPassword, newPassword);
      
      dispatch({ type: WALLET_CHANGE_PASSWORD_SUCCESS });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      dispatch({
        type: WALLET_CHANGE_PASSWORD_FAILURE,
        payload: errorMessage
      });
      
      throw error;
    }
  };
};