// GhostZK Wallet Extension - Background Script
// This script runs in the extension's background context

import { browser } from 'webextension-polyfill-ts';
import Keyring from './services/keyring';
import ProofEngine from '@ghostzk/proof-engine';

// Extension state
let walletUnlocked = false;
let lastActivityTime = Date.now();
let autoLockInterval: number | null = null;
let autoLockTimeoutMinutes = 5; // Default to 5 minutes

// Initialize services
const keyring = new Keyring();
const proofEngine = new ProofEngine();

// Initialize extension
async function initializeExtension() {
  console.log('Initializing GhostZK extension background script');
  
  try {
    // Initialize the proof engine
    await proofEngine.initialize();
    console.log('Proof engine initialized');
    
    // Check if wallet exists
    const isInitialized = await keyring.isInitialized();
    updateExtensionBadge(isInitialized);
    
    // Set up auto-lock timer
    setupAutoLock();
    
    // Load settings
    loadSettings();
    
    console.log('GhostZK background script initialized successfully');
  } catch (error) {
    console.error('Failed to initialize GhostZK extension:', error);
  }
}

// Load extension settings
async function loadSettings() {
  try {
    const storage = await browser.storage.local.get(['settings']);
    if (storage.settings?.autoLockTimeout) {
      autoLockTimeoutMinutes = storage.settings.autoLockTimeout;
      console.log(`Auto-lock timeout set to ${autoLockTimeoutMinutes} minutes`);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Update the extension's badge
function updateExtensionBadge(isInitialized: boolean) {
  if (isInitialized) {
    if (walletUnlocked) {
      // Green badge for unlocked wallet
      browser.browserAction.setBadgeBackgroundColor({ color: '#4CAF50' });
      browser.browserAction.setBadgeText({ text: '✓' });
    } else {
      // Yellow badge for locked wallet
      browser.browserAction.setBadgeBackgroundColor({ color: '#FFC107' });
      browser.browserAction.setBadgeText({ text: '🔒' });
    }
  } else {
    // No badge for uninitialized wallet
    browser.browserAction.setBadgeText({ text: '' });
  }
}

// Set up automatic wallet locking
function setupAutoLock() {
  if (autoLockInterval) {
    clearInterval(autoLockInterval);
  }
  
  // Only start auto-lock if timeout is greater than 0 (0 means never lock)
  if (autoLockTimeoutMinutes > 0) {
    autoLockInterval = window.setInterval(() => {
      const currentTime = Date.now();
      const inactiveTime = (currentTime - lastActivityTime) / (1000 * 60); // Convert to minutes
      
      if (walletUnlocked && inactiveTime >= autoLockTimeoutMinutes) {
        lockWallet();
      }
    }, 30000); // Check every 30 seconds
  }
}

// Lock the wallet
function lockWallet() {
  if (walletUnlocked) {
    keyring.lock();
    walletUnlocked = false;
    updateExtensionBadge(true);
    
    // Notify UI if open
    browser.runtime.sendMessage({ action: 'WALLET_LOCKED' });
    
    console.log('Wallet locked due to inactivity');
  }
}

// Update activity timestamp
function updateActivity() {
  lastActivityTime = Date.now();
}

// Handle messages from popup or content scripts
browser.runtime.onMessage.addListener(async (message, sender) => {
  console.log('Background received message:', message.action);
  updateActivity();
  
  // Handle different message types
  switch (message.action) {
    case 'GET_WALLET_STATUS':
      return {
        isInitialized: await keyring.isInitialized(),
        isUnlocked: walletUnlocked
      };
      
    case 'UNLOCK_WALLET':
      try {
        const success = await keyring.unlock(message.password);
        walletUnlocked = success;
        updateExtensionBadge(true);
        return { success };
      } catch (error) {
        console.error('Error unlocking wallet:', error);
        return { success: false, error: String(error) };
      }
      
    case 'LOCK_WALLET':
      lockWallet();
      return { success: true };
      
    case 'CREATE_WALLET':
      try {
        await keyring.createNewWallet(message.password, message.wordCount);
        walletUnlocked = true;
        updateExtensionBadge(true);
        return { success: true };
      } catch (error) {
        console.error('Error creating wallet:', error);
        return { success: false, error: String(error) };
      }
      
    case 'IMPORT_WALLET':
      try {
        await keyring.restoreFromMnemonic(message.mnemonic, message.password);
        walletUnlocked = true;
        updateExtensionBadge(true);
        return { success: true };
      } catch (error) {
        console.error('Error importing wallet:', error);
        return { success: false, error: String(error) };
      }
      
    case 'GET_ACCOUNTS':
      if (!walletUnlocked) {
        return { success: false, error: 'Wallet is locked' };
      }
      try {
        const accounts = keyring.getAccounts();
        return { success: true, accounts };
      } catch (error) {
        console.error('Error getting accounts:', error);
        return { success: false, error: String(error) };
      }
      
    case 'GENERATE_PROOF':
      if (!walletUnlocked) {
        return { success: false, error: 'Wallet is locked' };
      }
      try {
        const proof = await proofEngine.generateProof(message.input);
        return { success: true, proof };
      } catch (error) {
        console.error('Error generating proof:', error);
        return { success: false, error: String(error) };
      }
      
    case 'UPDATE_SETTINGS':
      if (message.settings?.autoLockTimeout !== undefined) {
        autoLockTimeoutMinutes = message.settings.autoLockTimeout;
        setupAutoLock();
      }
      return { success: true };
      
    default:
      console.warn('Unknown message action:', message.action);
      return { success: false, error: 'Unknown action' };
  }
});

// Handle messages from content scripts (web pages)
browser.runtime.onMessageExternal.addListener(async (message, sender) => {
  console.log('External message received from:', sender.url, message);
  
  // Only handle messages from authorized domains
  const url = new URL(sender.url || '');
  
  // TODO: Implement allowlist for domains or user approval flow
  
  switch (message.action) {
    case 'CONNECT_DAPP':
      // Handle dApp connection request
      return { action: 'CONNECT_RESPONSE', success: false, message: 'Not implemented yet' };
      
    case 'REQUEST_ACCOUNTS':
      if (!walletUnlocked) {
        return { action: 'ACCOUNT_RESPONSE', success: false, error: 'Wallet is locked' };
      }
      
      // Only return addresses, not private keys
      try {
        const accounts = keyring.getAccounts().map(acc => acc.address);
        return { action: 'ACCOUNT_RESPONSE', success: true, accounts };
      } catch (error) {
        console.error('Error getting accounts for dApp:', error);
        return { action: 'ACCOUNT_RESPONSE', success: false, error: String(error) };
      }
      
    default:
      console.warn('Unknown external message action:', message.action);
      return { success: false, error: 'Unknown action' };
  }
});

// Listen for installation/update events
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('GhostZK extension installed');
  } else if (details.reason === 'update') {
    console.log('GhostZK extension updated');
  }
});

// Initialize the extension when the background script loads
initializeExtension();