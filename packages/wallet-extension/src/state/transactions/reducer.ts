import { WALLET_LOCK_SUCCESS } from '../wallet/actions';

// Transaction Types
export enum TransactionType {
  TRANSFER_PUBLIC = 'TRANSFER_PUBLIC',
  TRANSFER_PRIVATE = 'TRANSFER_PRIVATE',
  SHIELD = 'SHIELD',
  UNSHIELD = 'UNSHIELD',
  MINT = 'MINT',
  BURN = 'BURN',
  EXECUTE_PROGRAM = 'EXECUTE_PROGRAM',
  DEPLOY_PROGRAM = 'DEPLOY_PROGRAM',
  META_TRANSACTION = 'META_TRANSACTION'
}

// Transaction Status
export enum TransactionStatus {
  PENDING = 'PENDING',
  GENERATING_PROOF = 'GENERATING_PROOF',
  SUBMITTING = 'SUBMITTING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED'
}

// Transaction Interface
export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  fromAddress: string;
  toAddress?: string;
  amount?: string;
  fee?: string;
  programId?: string;
  functionName?: string;
  inputs?: string[];
  timestamp: number;
  blockHeight?: number;
  txHash?: string;
  proofId?: string;
  error?: string;
  metadata?: Record<string, any>;
}

// Transaction State Interface
export interface TransactionsState {
  transactions: Record<string, Transaction>;
  pendingTransactions: string[];
  recentTransactions: string[];
  transactionsByAddress: Record<string, string[]>;
  isLoading: boolean;
  error: string | null;
  currentTransaction: string | null;
}

// Action Types
export const TRANSACTION_CREATE = 'TRANSACTION_CREATE';
export const TRANSACTION_UPDATE = 'TRANSACTION_UPDATE';
export const TRANSACTION_REMOVE = 'TRANSACTION_REMOVE';
export const TRANSACTION_SET_CURRENT = 'TRANSACTION_SET_CURRENT';
export const TRANSACTION_CLEAR_CURRENT = 'TRANSACTION_CLEAR_CURRENT';
export const TRANSACTION_PROOF_STARTED = 'TRANSACTION_PROOF_STARTED';
export const TRANSACTION_PROOF_COMPLETED = 'TRANSACTION_PROOF_COMPLETED';
export const TRANSACTION_PROOF_FAILED = 'TRANSACTION_PROOF_FAILED';
export const TRANSACTION_SUBMIT = 'TRANSACTION_SUBMIT';
export const TRANSACTION_CONFIRM = 'TRANSACTION_CONFIRM';
export const TRANSACTION_FAIL = 'TRANSACTION_FAIL';
export const TRANSACTION_REJECT = 'TRANSACTION_REJECT';
export const TRANSACTIONS_FETCH = 'TRANSACTIONS_FETCH';
export const TRANSACTIONS_FETCH_SUCCESS = 'TRANSACTIONS_FETCH_SUCCESS';
export const TRANSACTIONS_FETCH_FAILURE = 'TRANSACTIONS_FETCH_FAILURE';
export const TRANSACTIONS_CLEAR_ALL = 'TRANSACTIONS_CLEAR_ALL';

// Action Interfaces
interface TransactionCreateAction {
  type: typeof TRANSACTION_CREATE;
  payload: Transaction;
}

interface TransactionUpdateAction {
  type: typeof TRANSACTION_UPDATE;
  payload: {
    id: string;
    updates: Partial<Transaction>;
  };
}

interface TransactionRemoveAction {
  type: typeof TRANSACTION_REMOVE;
  payload: string;
}

interface TransactionSetCurrentAction {
  type: typeof TRANSACTION_SET_CURRENT;
  payload: string;
}

interface TransactionClearCurrentAction {
  type: typeof TRANSACTION_CLEAR_CURRENT;
}

interface TransactionProofStartedAction {
  type: typeof TRANSACTION_PROOF_STARTED;
  payload: string;
}

interface TransactionProofCompletedAction {
  type: typeof TRANSACTION_PROOF_COMPLETED;
  payload: {
    id: string;
    proofId: string;
  };
}

interface TransactionProofFailedAction {
  type: typeof TRANSACTION_PROOF_FAILED;
  payload: {
    id: string;
    error: string;
  };
}

interface TransactionSubmitAction {
  type: typeof TRANSACTION_SUBMIT;
  payload: string;
}

interface TransactionConfirmAction {
  type: typeof TRANSACTION_CONFIRM;
  payload: {
    id: string;
    txHash: string;
    blockHeight: number;
  };
}

interface TransactionFailAction {
  type: typeof TRANSACTION_FAIL;
  payload: {
    id: string;
    error: string;
  };
}

interface TransactionRejectAction {
  type: typeof TRANSACTION_REJECT;
  payload: string;
}

interface TransactionsFetchAction {
  type: typeof TRANSACTIONS_FETCH;
  payload: string; // address
}

interface TransactionsFetchSuccessAction {
  type: typeof TRANSACTIONS_FETCH_SUCCESS;
  payload: {
    address: string;
    transactions: Transaction[];
  };
}

interface TransactionsFetchFailureAction {
  type: typeof TRANSACTIONS_FETCH_FAILURE;
  payload: string;
}

interface TransactionsClearAllAction {
  type: typeof TRANSACTIONS_CLEAR_ALL;
}

interface WalletLockSuccessAction {
  type: typeof WALLET_LOCK_SUCCESS;
}

// Union type for all transaction actions
export type TransactionsActionTypes =
  | TransactionCreateAction
  | TransactionUpdateAction
  | TransactionRemoveAction
  | TransactionSetCurrentAction
  | TransactionClearCurrentAction
  | TransactionProofStartedAction
  | TransactionProofCompletedAction
  | TransactionProofFailedAction
  | TransactionSubmitAction
  | TransactionConfirmAction
  | TransactionFailAction
  | TransactionRejectAction
  | TransactionsFetchAction
  | TransactionsFetchSuccessAction
  | TransactionsFetchFailureAction
  | TransactionsClearAllAction
  | WalletLockSuccessAction;

// Initial state
const initialState: TransactionsState = {
  transactions: {},
  pendingTransactions: [],
  recentTransactions: [],
  transactionsByAddress: {},
  isLoading: false,
  error: null,
  currentTransaction: null
};

// Helper function to update the transaction lists
const updateTransactionLists = (
  state: TransactionsState,
  transaction: Transaction
): Partial<TransactionsState> => {
  // Create a copy of all relevant lists
  const pendingTransactions = [...state.pendingTransactions];
  const recentTransactions = [...state.recentTransactions];
  const transactionsByAddress = { ...state.transactionsByAddress };
  
  // Handle pending transactions list
  if (transaction.status === TransactionStatus.PENDING ||
      transaction.status === TransactionStatus.GENERATING_PROOF ||
      transaction.status === TransactionStatus.SUBMITTING) {
    if (!pendingTransactions.includes(transaction.id)) {
      pendingTransactions.push(transaction.id);
    }
  } else {
    const pendingIndex = pendingTransactions.indexOf(transaction.id);
    if (pendingIndex !== -1) {
      pendingTransactions.splice(pendingIndex, 1);
    }
  }
  
  // Handle recent transactions list (limited to 20 most recent)
  if (!recentTransactions.includes(transaction.id)) {
    recentTransactions.unshift(transaction.id);
    if (recentTransactions.length > 20) {
      recentTransactions.pop();
    }
  }
  
  // Handle transactions by address
  const fromAddress = transaction.fromAddress;
  if (!transactionsByAddress[fromAddress]) {
    transactionsByAddress[fromAddress] = [];
  }
  if (!transactionsByAddress[fromAddress].includes(transaction.id)) {
    transactionsByAddress[fromAddress].push(transaction.id);
  }
  
  if (transaction.toAddress && transaction.toAddress !== fromAddress) {
    if (!transactionsByAddress[transaction.toAddress]) {
      transactionsByAddress[transaction.toAddress] = [];
    }
    if (!transactionsByAddress[transaction.toAddress].includes(transaction.id)) {
      transactionsByAddress[transaction.toAddress].push(transaction.id);
    }
  }
  
  return {
    pendingTransactions,
    recentTransactions,
    transactionsByAddress
  };
};

// Transactions reducer
const transactionsReducer = (
  state = initialState,
  action: TransactionsActionTypes
): TransactionsState => {
  switch (action.type) {
    case TRANSACTION_CREATE: {
      const transaction = action.payload;
      const lists = updateTransactionLists(state, transaction);
      
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [transaction.id]: transaction
        },
        ...lists
      };
    }
    
    case TRANSACTION_UPDATE: {
      const { id, updates } = action.payload;
      const transaction = state.transactions[id];
      
      if (!transaction) {
        return state;
      }
      
      const updatedTransaction = {
        ...transaction,
        ...updates
      };
      
      const lists = updateTransactionLists(state, updatedTransaction);
      
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [id]: updatedTransaction
        },
        ...lists
      };
    }
    
    case TRANSACTION_REMOVE: {
      const id = action.payload;
      const { [id]: _, ...remainingTransactions } = state.transactions;
      
      // Remove from all lists
      const pendingTransactions = state.pendingTransactions.filter(
        txId => txId !== id
      );
      const recentTransactions = state.recentTransactions.filter(
        txId => txId !== id
      );
      
      // Remove from address lists
      const transactionsByAddress = { ...state.transactionsByAddress };
      Object.keys(transactionsByAddress).forEach(address => {
        transactionsByAddress[address] = transactionsByAddress[address].filter(
          txId => txId !== id
        );
      });
      
      return {
        ...state,
        transactions: remainingTransactions,
        pendingTransactions,
        recentTransactions,
        transactionsByAddress,
        currentTransaction: state.currentTransaction === id ? null : state.currentTransaction
      };
    }
    
    case TRANSACTION_SET_CURRENT:
      return {
        ...state,
        currentTransaction: action.payload
      };
    
    case TRANSACTION_CLEAR_CURRENT:
      return {
        ...state,
        currentTransaction: null
      };
    
    case TRANSACTION_PROOF_STARTED:
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [action.payload]: {
            ...state.transactions[action.payload],
            status: TransactionStatus.GENERATING_PROOF
          }
        }
      };
    
    case TRANSACTION_PROOF_COMPLETED:
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [action.payload.id]: {
            ...state.transactions[action.payload.id],
            proofId: action.payload.proofId
          }
        }
      };
    
    case TRANSACTION_PROOF_FAILED:
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [action.payload.id]: {
            ...state.transactions[action.payload.id],
            status: TransactionStatus.FAILED,
            error: action.payload.error
          }
        },
        pendingTransactions: state.pendingTransactions.filter(
          id => id !== action.payload.id
        )
      };
    
    case TRANSACTION_SUBMIT:
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [action.payload]: {
            ...state.transactions[action.payload],
            status: TransactionStatus.SUBMITTING
          }
        }
      };
    
    case TRANSACTION_CONFIRM: {
      const { id, txHash, blockHeight } = action.payload;
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [id]: {
            ...state.transactions[id],
            status: TransactionStatus.CONFIRMED,
            txHash,
            blockHeight
          }
        },
        pendingTransactions: state.pendingTransactions.filter(txId => txId !== id)
      };
    }
    
    case TRANSACTION_FAIL: {
      const { id, error } = action.payload;
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [id]: {
            ...state.transactions[id],
            status: TransactionStatus.FAILED,
            error
          }
        },
        pendingTransactions: state.pendingTransactions.filter(txId => txId !== id)
      };
    }
    
    case TRANSACTION_REJECT:
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [action.payload]: {
            ...state.transactions[action.payload],
            status: TransactionStatus.REJECTED
          }
        },
        pendingTransactions: state.pendingTransactions.filter(
          id => id !== action.payload
        )
      };
    
    case TRANSACTIONS_FETCH:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case TRANSACTIONS_FETCH_SUCCESS: {
      const { address, transactions } = action.payload;
      const transactionsMap: Record<string, Transaction> = {};
      const transactionIds: string[] = [];
      
      // Add all fetched transactions to the state
      transactions.forEach(tx => {
        transactionsMap[tx.id] = tx;
        transactionIds.push(tx.id);
      });
      
      return {
        ...state,
        transactions: {
          ...state.transactions,
          ...transactionsMap
        },
        transactionsByAddress: {
          ...state.transactionsByAddress,
          [address]: transactionIds
        },
        isLoading: false
      };
    }
    
    case TRANSACTIONS_FETCH_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    
    case TRANSACTIONS_CLEAR_ALL:
      return initialState;
    
    case WALLET_LOCK_SUCCESS:
      return initialState;
    
    default:
      return state;
  }
};

export default transactionsReducer;