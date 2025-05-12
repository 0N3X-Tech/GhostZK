import { WALLET_LOCK_SUCCESS } from '../wallet/actions';

// Setting Types
export enum Theme {
  DARK = 'DARK',
  LIGHT = 'LIGHT',
  SYSTEM = 'SYSTEM'
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CNY = 'CNY'
}

export enum Language {
  EN = 'en',
  ES = 'es',
  FR = 'fr',
  ZH = 'zh',
  RU = 'ru',
  JA = 'ja'
}

export enum PrivacyLevel {
  STANDARD = 'STANDARD',
  HIGH = 'HIGH',
  MAXIMUM = 'MAXIMUM'
}

// Settings State Interface
export interface SettingsState {
  theme: Theme;
  currency: Currency;
  language: Language;
  privacyLevel: PrivacyLevel;
  autoLockTimeout: number; // in minutes, 0 means never
  showTestnetWarning: boolean;
  requirePasswordForTransactions: boolean;
  enableMetaTransactions: boolean;
  showBalanceInHeader: boolean;
  developerMode: boolean;
  advancedMode: boolean;
  hideSensitiveData: boolean;
  isModified: boolean;
}

// Action Types
export const SETTINGS_UPDATE = 'SETTINGS_UPDATE';
export const SETTINGS_RESET = 'SETTINGS_RESET';
export const SETTINGS_TOGGLE_DEVELOPER_MODE = 'SETTINGS_TOGGLE_DEVELOPER_MODE';
export const SETTINGS_TOGGLE_ADVANCED_MODE = 'SETTINGS_TOGGLE_ADVANCED_MODE';
export const SETTINGS_SET_THEME = 'SETTINGS_SET_THEME';
export const SETTINGS_SET_CURRENCY = 'SETTINGS_SET_CURRENCY';
export const SETTINGS_SET_LANGUAGE = 'SETTINGS_SET_LANGUAGE';
export const SETTINGS_SET_PRIVACY_LEVEL = 'SETTINGS_SET_PRIVACY_LEVEL';
export const SETTINGS_SET_AUTO_LOCK_TIMEOUT = 'SETTINGS_SET_AUTO_LOCK_TIMEOUT';
export const SETTINGS_TOGGLE_PASSWORD_REQUIREMENT = 'SETTINGS_TOGGLE_PASSWORD_REQUIREMENT';
export const SETTINGS_TOGGLE_META_TRANSACTIONS = 'SETTINGS_TOGGLE_META_TRANSACTIONS';
export const SETTINGS_TOGGLE_BALANCE_VISIBILITY = 'SETTINGS_TOGGLE_BALANCE_VISIBILITY';
export const SETTINGS_TOGGLE_SENSITIVE_DATA = 'SETTINGS_TOGGLE_SENSITIVE_DATA';
export const SETTINGS_DISMISS_TESTNET_WARNING = 'SETTINGS_DISMISS_TESTNET_WARNING';

// Action Interfaces
interface SettingsUpdateAction {
  type: typeof SETTINGS_UPDATE;
  payload: Partial<SettingsState>;
}

interface SettingsResetAction {
  type: typeof SETTINGS_RESET;
}

interface SettingsToggleDeveloperModeAction {
  type: typeof SETTINGS_TOGGLE_DEVELOPER_MODE;
}

interface SettingsToggleAdvancedModeAction {
  type: typeof SETTINGS_TOGGLE_ADVANCED_MODE;
}

interface SettingsSetThemeAction {
  type: typeof SETTINGS_SET_THEME;
  payload: Theme;
}

interface SettingsSetCurrencyAction {
  type: typeof SETTINGS_SET_CURRENCY;
  payload: Currency;
}

interface SettingsSetLanguageAction {
  type: typeof SETTINGS_SET_LANGUAGE;
  payload: Language;
}

interface SettingsSetPrivacyLevelAction {
  type: typeof SETTINGS_SET_PRIVACY_LEVEL;
  payload: PrivacyLevel;
}

interface SettingsSetAutoLockTimeoutAction {
  type: typeof SETTINGS_SET_AUTO_LOCK_TIMEOUT;
  payload: number;
}

interface SettingsTogglePasswordRequirementAction {
  type: typeof SETTINGS_TOGGLE_PASSWORD_REQUIREMENT;
}

interface SettingsToggleMetaTransactionsAction {
  type: typeof SETTINGS_TOGGLE_META_TRANSACTIONS;
}

interface SettingsToggleBalanceVisibilityAction {
  type: typeof SETTINGS_TOGGLE_BALANCE_VISIBILITY;
}

interface SettingsToggleSensitiveDataAction {
  type: typeof SETTINGS_TOGGLE_SENSITIVE_DATA;
}

interface SettingsDismissTestnetWarningAction {
  type: typeof SETTINGS_DISMISS_TESTNET_WARNING;
}

interface WalletLockSuccessAction {
  type: typeof WALLET_LOCK_SUCCESS;
}

// Union type for all settings actions
export type SettingsActionTypes =
  | SettingsUpdateAction
  | SettingsResetAction
  | SettingsToggleDeveloperModeAction
  | SettingsToggleAdvancedModeAction
  | SettingsSetThemeAction
  | SettingsSetCurrencyAction
  | SettingsSetLanguageAction
  | SettingsSetPrivacyLevelAction
  | SettingsSetAutoLockTimeoutAction
  | SettingsTogglePasswordRequirementAction
  | SettingsToggleMetaTransactionsAction
  | SettingsToggleBalanceVisibilityAction
  | SettingsToggleSensitiveDataAction
  | SettingsDismissTestnetWarningAction
  | WalletLockSuccessAction;

// Initial state
const initialState: SettingsState = {
  theme: Theme.DARK,
  currency: Currency.USD,
  language: Language.EN,
  privacyLevel: PrivacyLevel.STANDARD,
  autoLockTimeout: 5, // 5 minutes
  showTestnetWarning: true,
  requirePasswordForTransactions: true,
  enableMetaTransactions: true,
  showBalanceInHeader: true,
  developerMode: false,
  advancedMode: false,
  hideSensitiveData: false,
  isModified: false
};

// Settings reducer
const settingsReducer = (
  state = initialState,
  action: SettingsActionTypes
): SettingsState => {
  switch (action.type) {
    case SETTINGS_UPDATE:
      return {
        ...state,
        ...action.payload,
        isModified: true
      };
    
    case SETTINGS_RESET:
      return {
        ...initialState,
        isModified: true
      };
    
    case SETTINGS_TOGGLE_DEVELOPER_MODE:
      return {
        ...state,
        developerMode: !state.developerMode,
        isModified: true
      };
    
    case SETTINGS_TOGGLE_ADVANCED_MODE:
      return {
        ...state,
        advancedMode: !state.advancedMode,
        isModified: true
      };
    
    case SETTINGS_SET_THEME:
      return {
        ...state,
        theme: action.payload,
        isModified: true
      };
    
    case SETTINGS_SET_CURRENCY:
      return {
        ...state,
        currency: action.payload,
        isModified: true
      };
    
    case SETTINGS_SET_LANGUAGE:
      return {
        ...state,
        language: action.payload,
        isModified: true
      };
    
    case SETTINGS_SET_PRIVACY_LEVEL:
      return {
        ...state,
        privacyLevel: action.payload,
        isModified: true
      };
    
    case SETTINGS_SET_AUTO_LOCK_TIMEOUT:
      return {
        ...state,
        autoLockTimeout: action.payload,
        isModified: true
      };
    
    case SETTINGS_TOGGLE_PASSWORD_REQUIREMENT:
      return {
        ...state,
        requirePasswordForTransactions: !state.requirePasswordForTransactions,
        isModified: true
      };
    
    case SETTINGS_TOGGLE_META_TRANSACTIONS:
      return {
        ...state,
        enableMetaTransactions: !state.enableMetaTransactions,
        isModified: true
      };
    
    case SETTINGS_TOGGLE_BALANCE_VISIBILITY:
      return {
        ...state,
        showBalanceInHeader: !state.showBalanceInHeader,
        isModified: true
      };
    
    case SETTINGS_TOGGLE_SENSITIVE_DATA:
      return {
        ...state,
        hideSensitiveData: !state.hideSensitiveData,
        isModified: true
      };
    
    case SETTINGS_DISMISS_TESTNET_WARNING:
      return {
        ...state,
        showTestnetWarning: false,
        isModified: true
      };
    
    case WALLET_LOCK_SUCCESS:
      // Settings should persist after lock, no changes
      return state;
    
    default:
      return state;
  }
};

export default settingsReducer;