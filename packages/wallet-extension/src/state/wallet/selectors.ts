import { RootState } from '../store';
import { AleoAccount } from '../../services/keyring';

// Basic wallet state selectors
export const selectWalletState = (state: RootState) => state.wallet;
export const selectIsInitialized = (state: RootState) => state.wallet.isInitialized;
export const selectIsUnlocked = (state: RootState) => state.wallet.isUnlocked;
export const selectIsLoading = (state: RootState) => state.wallet.isLoading;
export const selectError = (state: RootState) => state.wallet.error;
export const selectProcessingAction = (state: RootState) => state.wallet.processingAction;

// Account selectors
export const selectAccounts = (state: RootState) => state.wallet.accounts;
export const selectAccountsCount = (state: RootState) => state.wallet.accounts.length;
export const selectActiveAccountIndex = (state: RootState) => state.wallet.activeAccountIndex;

// Get the currently active account
export const selectActiveAccount = (state: RootState): AleoAccount | null => {
  const accounts = state.wallet.accounts;
  const activeIndex = state.wallet.activeAccountIndex;
  
  if (accounts.length === 0 || activeIndex >= accounts.length) {
    return null;
  }
  
  return accounts[activeIndex];
};

// Get a specific account by index
export const selectAccountByIndex = (state: RootState, index: number): AleoAccount | null => {
  const accounts = state.wallet.accounts;
  
  if (accounts.length === 0 || index < 0 || index >= accounts.length) {
    return null;
  }
  
  return accounts[index];
};

// Get account by address
export const selectAccountByAddress = (state: RootState, address: string): AleoAccount | null => {
  const accounts = state.wallet.accounts;
  const foundAccount = accounts.find(account => account.address === address);
  
  return foundAccount || null;
};

// Utility selectors
export const selectIsProcessing = (state: RootState) => !!state.wallet.processingAction;
export const selectHasMultipleAccounts = (state: RootState) => state.wallet.accounts.length > 1;
export const selectAllAddresses = (state: RootState) => state.wallet.accounts.map(account => account.address);

// Status selectors for specific operations
export const selectIsCreatingWallet = (state: RootState) => state.wallet.processingAction === 'create';
export const selectIsImportingWallet = (state: RootState) => state.wallet.processingAction === 'import';
export const selectIsUnlockingWallet = (state: RootState) => state.wallet.processingAction === 'unlock';
export const selectIsAddingAccount = (state: RootState) => state.wallet.processingAction === 'addAccount';
export const selectIsImportingAccount = (state: RootState) => state.wallet.processingAction === 'importAccount';
export const selectIsChangingPassword = (state: RootState) => state.wallet.processingAction === 'changePassword';