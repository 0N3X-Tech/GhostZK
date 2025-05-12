import * as bip39 from 'bip39';
import { ProofEngine } from '@ghostzk/proof-engine';
import CryptoJS from 'crypto-js';

/**
 * Represents an Aleo account with its associated keys
 */
export interface AleoAccount {
  address: string;
  privateKey: string;
  viewKey: string;
  index: number;
  name: string;
}

/**
 * Interface for encrypted keyring data stored in extension storage
 */
interface EncryptedKeyringData {
  encryptedMnemonic: string;
  encryptedAccounts: string;
  salt: string;
  iv: string;
  iterationCount: number;
}

/**
 * Error class for keyring-related errors
 */
export class KeyringError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KeyringError';
  }
}

/**
 * GhostZK Keyring Service
 * 
 * Manages cryptographic keys for the GhostZK wallet, including:
 * - Mnemonic generation and restoration
 * - Account derivation and management
 * - Secure storage with encryption
 */
export class Keyring {
  private mnemonic: string | null = null;
  private accounts: AleoAccount[] = [];
  private encryptionKey: string | null = null;
  private proofEngine: ProofEngine | null = null;
  private unlocked: boolean = false;

  constructor() {
    this.proofEngine = new ProofEngine();
  }

  /**
   * Initialize the keyring and proof engine
   */
  public async initialize(): Promise<void> {
    if (!this.proofEngine) {
      this.proofEngine = new ProofEngine();
    }
    
    if (!this.proofEngine.isInitialized()) {
      await this.proofEngine.initialize();
    }
  }

  /**
   * Check if the keyring has been initialized with a mnemonic
   */
  public async isInitialized(): Promise<boolean> {
    try {
      const data = await this.loadEncryptedData();
      return !!data && !!data.encryptedMnemonic;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if the keyring is currently unlocked
   */
  public isUnlocked(): boolean {
    return this.unlocked && !!this.mnemonic;
  }

  /**
   * Create a new wallet with a fresh mnemonic
   * @param password - The password to encrypt the keyring data
   * @param wordCount - The number of words in the mnemonic (12, 15, 18, 21, or 24)
   */
  public async createNewWallet(password: string, wordCount: 12 | 15 | 18 | 21 | 24 = 24): Promise<void> {
    await this.initialize();
    
    // Generate a new mnemonic phrase with the specified entropy
    const strength = (wordCount / 3) * 32;
    const mnemonic = bip39.generateMnemonic(strength);
    
    await this.restoreFromMnemonic(mnemonic, password);
  }

  /**
   * Restore a wallet from an existing mnemonic phrase
   * @param mnemonic - The mnemonic phrase
   * @param password - The password to encrypt the keyring data
   */
  public async restoreFromMnemonic(mnemonic: string, password: string): Promise<void> {
    await this.initialize();
    
    // Validate the mnemonic
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new KeyringError('Invalid mnemonic phrase');
    }
    
    this.mnemonic = mnemonic;
    this.encryptionKey = password;
    this.unlocked = true;
    
    // Create the first account
    await this.addAccount('Account 1');
    
    // Save the keyring data
    await this.persistEncryptedData();
  }

  /**
   * Unlock the keyring with a password
   * @param password - The password to decrypt the keyring data
   */
  public async unlock(password: string): Promise<boolean> {
    await this.initialize();
    
    try {
      const encryptedData = await this.loadEncryptedData();
      if (!encryptedData) {
        throw new KeyringError('No keyring data found');
      }
      
      const { encryptedMnemonic, encryptedAccounts, salt, iv, iterationCount } = encryptedData;
      
      // Derive the encryption key
      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: iterationCount
      });
      
      // Decrypt the mnemonic
      const decryptedMnemonicBytes = CryptoJS.AES.decrypt(encryptedMnemonic, key.toString(), {
        iv: CryptoJS.enc.Hex.parse(iv)
      });
      
      const decryptedMnemonic = decryptedMnemonicBytes.toString(CryptoJS.enc.Utf8);
      
      // Validate the decrypted mnemonic
      if (!bip39.validateMnemonic(decryptedMnemonic)) {
        return false;
      }
      
      // Decrypt the accounts
      const decryptedAccountsBytes = CryptoJS.AES.decrypt(encryptedAccounts, key.toString(), {
        iv: CryptoJS.enc.Hex.parse(iv)
      });
      
      const decryptedAccounts = JSON.parse(decryptedAccountsBytes.toString(CryptoJS.enc.Utf8));
      
      // Set the keyring state
      this.mnemonic = decryptedMnemonic;
      this.accounts = decryptedAccounts;
      this.encryptionKey = password;
      this.unlocked = true;
      
      return true;
    } catch (error) {
      console.error('Failed to unlock keyring:', error);
      return false;
    }
  }

  /**
   * Lock the keyring, clearing sensitive data from memory
   */
  public lock(): void {
    this.mnemonic = null;
    this.encryptionKey = null;
    this.unlocked = false;
  }

  /**
   * Add a new account to the keyring
   * @param name - A friendly name for the account
   */
  public async addAccount(name: string): Promise<AleoAccount> {
    if (!this.isUnlocked()) {
      throw new KeyringError('Keyring is locked');
    }
    
    if (!this.proofEngine) {
      throw new KeyringError('Proof engine not initialized');
    }
    
    try {
      // For Aleo, we can generate unique keypairs directly
      // Later implementation may use HD derivation paths with the mnemonic seed
      const newAccountIndex = this.accounts.length;
      const aleoAccount = await this.proofEngine.generateAccount();
      
      const account: AleoAccount = {
        address: aleoAccount.address,
        privateKey: aleoAccount.privateKey,
        viewKey: aleoAccount.viewKey,
        index: newAccountIndex,
        name
      };
      
      this.accounts.push(account);
      await this.persistEncryptedData();
      
      return account;
    } catch (error) {
      throw new KeyringError(`Failed to add account: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Import an account using a private key
   * @param privateKey - The private key to import
   * @param name - A friendly name for the account
   */
  public async importPrivateKey(privateKey: string, name: string): Promise<AleoAccount> {
    if (!this.isUnlocked()) {
      throw new KeyringError('Keyring is locked');
    }
    
    if (!this.proofEngine) {
      throw new KeyringError('Proof engine not initialized');
    }
    
    try {
      // Validate and derive the view key and address from the private key
      const viewKey = await this.proofEngine.deriveViewKey(privateKey);
      const address = await this.proofEngine.deriveAddress(privateKey);
      
      // Check if the account already exists
      const existingAccount = this.accounts.find(acc => acc.privateKey === privateKey);
      if (existingAccount) {
        throw new KeyringError('Account already exists in the keyring');
      }
      
      const newAccountIndex = this.accounts.length;
      const account: AleoAccount = {
        address,
        privateKey,
        viewKey,
        index: newAccountIndex,
        name
      };
      
      this.accounts.push(account);
      await this.persistEncryptedData();
      
      return account;
    } catch (error) {
      throw new KeyringError(`Failed to import private key: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get all accounts in the keyring
   */
  public getAccounts(): AleoAccount[] {
    if (!this.isUnlocked()) {
      throw new KeyringError('Keyring is locked');
    }
    
    return [...this.accounts];
  }

  /**
   * Get an account by index
   * @param index - The account index
   */
  public getAccount(index: number): AleoAccount {
    if (!this.isUnlocked()) {
      throw new KeyringError('Keyring is locked');
    }
    
    const account = this.accounts[index];
    if (!account) {
      throw new KeyringError(`Account not found at index ${index}`);
    }
    
    return { ...account };
  }

  /**
   * Rename an account
   * @param index - The account index
   * @param name - The new account name
   */
  public async renameAccount(index: number, name: string): Promise<void> {
    if (!this.isUnlocked()) {
      throw new KeyringError('Keyring is locked');
    }
    
    const account = this.accounts[index];
    if (!account) {
      throw new KeyringError(`Account not found at index ${index}`);
    }
    
    account.name = name;
    await this.persistEncryptedData();
  }

  /**
   * Remove an account from the keyring
   * @param index - The account index
   */
  public async removeAccount(index: number): Promise<void> {
    if (!this.isUnlocked()) {
      throw new KeyringError('Keyring is locked');
    }
    
    if (index < 0 || index >= this.accounts.length) {
      throw new KeyringError(`Account not found at index ${index}`);
    }
    
    // Keep at least one account
    if (this.accounts.length <= 1) {
      throw new KeyringError('Cannot remove the only account');
    }
    
    this.accounts.splice(index, 1);
    
    // Update indices for remaining accounts
    this.accounts.forEach((account, i) => {
      account.index = i;
    });
    
    await this.persistEncryptedData();
  }

  /**
   * Export the mnemonic phrase (requires password confirmation)
   * @param password - The password to confirm authorization
   */
  public exportMnemonic(password: string): string {
    if (!this.isUnlocked() || !this.mnemonic) {
      throw new KeyringError('Keyring is locked');
    }
    
    if (password !== this.encryptionKey) {
      throw new KeyringError('Invalid password');
    }
    
    return this.mnemonic;
  }

  /**
   * Export a private key (requires password confirmation)
   * @param index - The account index
   * @param password - The password to confirm authorization
   */
  public exportPrivateKey(index: number, password: string): string {
    if (!this.isUnlocked()) {
      throw new KeyringError('Keyring is locked');
    }
    
    if (password !== this.encryptionKey) {
      throw new KeyringError('Invalid password');
    }
    
    const account = this.accounts[index];
    if (!account) {
      throw new KeyringError(`Account not found at index ${index}`);
    }
    
    return account.privateKey;
  }

  /**
   * Change the keyring password
   * @param currentPassword - The current password
   * @param newPassword - The new password
   */
  public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.isUnlocked() || !this.mnemonic) {
      throw new KeyringError('Keyring is locked');
    }
    
    if (currentPassword !== this.encryptionKey) {
      throw new KeyringError('Invalid current password');
    }
    
    this.encryptionKey = newPassword;
    await this.persistEncryptedData();
  }

  /**
   * Encrypt and store the keyring data
   */
  private async persistEncryptedData(): Promise<void> {
    if (!this.isUnlocked() || !this.mnemonic || !this.encryptionKey) {
      throw new KeyringError('Cannot persist data: keyring is locked');
    }
    
    // Generate a random salt and IV
    const salt = CryptoJS.lib.WordArray.random(16).toString();
    const iv = CryptoJS.lib.WordArray.random(16).toString();
    const iterationCount = 10000;
    
    // Derive the encryption key
    const key = CryptoJS.PBKDF2(this.encryptionKey, salt, {
      keySize: 256 / 32,
      iterations: iterationCount
    });
    
    // Encrypt the mnemonic
    const encryptedMnemonic = CryptoJS.AES.encrypt(this.mnemonic, key.toString(), {
      iv: CryptoJS.enc.Hex.parse(iv)
    }).toString();
    
    // Encrypt the accounts
    const encryptedAccounts = CryptoJS.AES.encrypt(
      JSON.stringify(this.accounts),
      key.toString(),
      { iv: CryptoJS.enc.Hex.parse(iv) }
    ).toString();
    
    const encryptedData: EncryptedKeyringData = {
      encryptedMnemonic,
      encryptedAccounts,
      salt,
      iv,
      iterationCount
    };
    
    await this.saveEncryptedData(encryptedData);
  }

  /**
   * Save encrypted keyring data to storage
   * @param data - The encrypted keyring data
   */
  private async saveEncryptedData(data: EncryptedKeyringData): Promise<void> {
    try {
      // Using Chrome extension storage API
      if (chrome?.storage?.local) {
        await chrome.storage.local.set({ keyringData: data });
      } else {
        // Fallback to localStorage for development environments
        localStorage.setItem('keyringData', JSON.stringify(data));
      }
    } catch (error) {
      throw new KeyringError(`Failed to save encrypted data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load encrypted keyring data from storage
   */
  private async loadEncryptedData(): Promise<EncryptedKeyringData | null> {
    try {
      // Using Chrome extension storage API
      if (chrome?.storage?.local) {
        const result = await chrome.storage.local.get('keyringData');
        return result.keyringData || null;
      } else {
        // Fallback to localStorage for development environments
        const data = localStorage.getItem('keyringData');
        return data ? JSON.parse(data) : null;
      }
    } catch (error) {
      throw new KeyringError(`Failed to load encrypted data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default Keyring;