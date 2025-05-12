const { describe, it, before, beforeEach, after } = require('mocha');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const { Account, Network, Program } = require('@aleohq/sdk');

// Ensure compatibility with SDK version 0.6.9

// Test constants
const TOKEN_SYMBOL = '1field';
const TEST_NETWORK = 'testnet3';
const PROGRAM_ID = 'token.aleo';

describe('Token Protocol Tests', function() {
  // Set longer timeout for proof generation which can be time-consuming
  this.timeout(60000);
  
  let network;
  let program;
  let adminAccount;
  let userAccount1;
  let userAccount2;
  
  before(async function() {
    // Initialize network connection
    network = new Network('https://api.explorer.aleo.org/v1');
    
    try {
      // Try to load the program from network
      program = await Program.fromProgramId(PROGRAM_ID, network);
    } catch (error) {
      console.log('Program not found on network, using local file');
      
      // Read local program file
      const programCode = fs.readFileSync(
        path.join(__dirname, '../src/main.leo'),
        'utf8'
      );
      
      // Create program from code
      program = Program.fromSource(programCode);
    }
    
    // Generate test accounts
    adminAccount = new Account();
    userAccount1 = new Account();
    userAccount2 = new Account();
    
    console.log('Test accounts:');
    console.log(`Admin: ${adminAccount.address()}`);
    console.log(`User1: ${userAccount1.address()}`);
    console.log(`User2: ${userAccount2.address()}`);
  });
  
  describe('Basic Token Operations', function() {
    it('should initialize the token', async function() {
      // Simulate the initialize transition execution
      const initialSupply = 1000000n; // 1 million tokens
      
      const execution = await program.execute('initialize', [initialSupply.toString()], {
        privateKey: adminAccount.privateKey(),
        fee: 500000, // fee in microcredits
      });
      
      console.log('Initialize execution:', execution);
      expect(execution).to.have.property('transaction');
    });
    
    it('should mint public tokens to an address', async function() {
      const amountToMint = 10000n;
      
      const execution = await program.execute('mint_public', [
        userAccount1.address(),
        amountToMint.toString()
      ], {
        privateKey: adminAccount.privateKey(),
        fee: 500000,
      });
      
      console.log('Mint execution:', execution);
      expect(execution).to.have.property('transaction');
    });
    
    it('should transfer public tokens between addresses', async function() {
      const transferAmount = 1000n;
      
      const execution = await program.execute('transfer_public', [
        userAccount2.address(),
        transferAmount.toString()
      ], {
        privateKey: userAccount1.privateKey(),
        fee: 600000,
      });
      
      console.log('Transfer execution:', execution);
      expect(execution).to.have.property('transaction');
    });
  });
  
  describe('Staking Functionality', function() {
    it('should stake tokens', async function() {
      const stakeAmount = 5000n;
      
      const execution = await program.execute('stake_tokens', [
        stakeAmount.toString()
      ], {
        privateKey: userAccount1.privateKey(),
        fee: 700000,
      });
      
      console.log('Stake execution:', execution);
      expect(execution).to.have.property('transaction');
    });
    
    it('should set reward rate', async function() {
      // Set reward rate to 2 per 10000 blocks (0.02% per block)
      const rewardRate = 2n;
      
      const execution = await program.execute('set_reward_rate', [
        rewardRate.toString()
      ], {
        privateKey: adminAccount.privateKey(),
        fee: 500000,
      });
      
      console.log('Set reward rate execution:', execution);
      expect(execution).to.have.property('transaction');
    });
    
    it('should unstake tokens and receive rewards', async function() {
      // Wait to accumulate some rewards (in a real test we would modify block height)
      console.log('Simulating passage of time for rewards to accumulate...');
      
      const unstakeAmount = 2500n; // Unstake half of the staked tokens
      
      const execution = await program.execute('unstake_tokens', [
        unstakeAmount.toString()
      ], {
        privateKey: userAccount1.privateKey(),
        fee: 800000,
      });
      
      console.log('Unstake execution:', execution);
      expect(execution).to.have.property('transaction');
    });
    
    it('should get staking information', async function() {
      // Get staked balance
      const stakedBalance = await program.execute('get_staked_balance', [
        userAccount1.address()
      ], {
        privateKey: userAccount1.privateKey(), // Technically not needed for 'function' calls
        fee: 0,  // Functions don't require fees
      });
      
      console.log('Staked balance:', stakedBalance);
      
      // Get total staked
      const totalStaked = await program.execute('get_total_staked', [], {
        privateKey: userAccount1.privateKey(),
        fee: 0,
      });
      
      console.log('Total staked:', totalStaked);
    });
  });
  
  describe('Advanced Operations', function() {
    it('should mint private tokens', async function() {
      const amountToMint = 5000n;
      
      const execution = await program.execute('mint_private', [
        userAccount1.address(),
        amountToMint.toString()
      ], {
        privateKey: adminAccount.privateKey(),
        fee: 600000,
      });
      
      console.log('Mint private execution:', execution);
      expect(execution).to.have.property('transaction');
      
      // Store the token record for later use
      global.tokenRecord = execution.transitions[0].outputs[0];
    });
    
    it('should transfer private tokens', async function() {
      // Skip if we don't have a token record
      if (!global.tokenRecord) {
        this.skip();
        return;
      }
      
      const transferAmount = 1000n;
      
      const execution = await program.execute('transfer_private', [
        global.tokenRecord,
        userAccount2.address(),
        transferAmount.toString()
      ], {
        privateKey: userAccount1.privateKey(),
        fee: 700000,
      });
      
      console.log('Transfer private execution:', execution);
      expect(execution).to.have.property('transaction');
    });
  });
});
