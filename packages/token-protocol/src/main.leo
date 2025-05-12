program token.aleo {
    // Record definitions
    record Token {
        // The token owner
        owner: address,
        // The token amount
        amount: u64,
        // Optional encrypted metadata field
        metadata: field,
    }

    // Struct for public token balances
    mapping balances: address => u64;
    
    // Total token supply
    mapping total_supply: field => u64;

    // Mapping of token symbol to boolean (for initialization check)
    mapping initialized: field => bool;

    // Token symbol and metadata
    const TOKEN_SYMBOL: field = 1field;  // Example field representation
    const DECIMALS: u8 = 8u8;
    
    // Initialize the token contract
    transition initialize(public initial_supply: u64) {
        // Ensure contract is initialized only once
        assert(!Mapping::contains(initialized, TOKEN_SYMBOL));
        
        // Set the token as initialized
        Mapping::set(initialized, TOKEN_SYMBOL, true);
        
        // Set the initial supply
        Mapping::set(total_supply, TOKEN_SYMBOL, initial_supply);
        
        return;
    }

    // Mint tokens publicly to a specific address
    transition mint_public(public receiver: address, public amount: u64) {
        // Retrieve current balance or default to 0
        let current_balance: u64 = Mapping::get_or_use(balances, receiver, 0u64);
        
        // Calculate new balance
        let new_balance: u64 = current_balance + amount;
        
        // Update balances mapping
        Mapping::set(balances, receiver, new_balance);
        
        // Update total supply
        let current_supply: u64 = Mapping::get(total_supply, TOKEN_SYMBOL);
        Mapping::set(total_supply, TOKEN_SYMBOL, current_supply + amount);
        
        return;
    }
    
    // Mint tokens privately to a specific address
    transition mint_private(public receiver: address, public amount: u64) -> Token {
        // Update total supply
        let current_supply: u64 = Mapping::get(total_supply, TOKEN_SYMBOL);
        Mapping::set(total_supply, TOKEN_SYMBOL, current_supply + amount);
        
        // Create a new token record
        return Token {
            owner: receiver,
            amount: amount,
            metadata: TOKEN_SYMBOL,
        };
    }
    
    // Publicly transfer tokens to another address
    transition transfer_public(public receiver: address, public amount: u64) {
        // Get sender's address
        let sender: address = self.caller;
        
        // Retrieve current balances
        let sender_balance: u64 = Mapping::get(balances, sender);
        let receiver_balance: u64 = Mapping::get_or_use(balances, receiver, 0u64);
        
        // Ensure sender has sufficient balance
        assert(sender_balance >= amount);
        
        // Update balances
        Mapping::set(balances, sender, sender_balance - amount);
        Mapping::set(balances, receiver, receiver_balance + amount);
        
        return;
    }
    
    // Privately transfer tokens
    transition transfer_private(token: Token, public receiver: address, public amount: u64) -> (Token, Token) {
        // Ensure the sender has sufficient balance
        assert(token.amount >= amount);
        
        // Create a token for the receiver
        let recipient_token: Token = Token {
            owner: receiver,
            amount: amount,
            metadata: token.metadata,
        };
        
        // Create a change token for the sender
        let change_token: Token = Token {
            owner: token.owner,
            amount: token.amount - amount,
            metadata: token.metadata,
        };
        
        return (recipient_token, change_token);
    }
    
    // Convert public tokens to private tokens
    transition shield(public amount: u64) -> Token {
        // Get caller's address
        let caller: address = self.caller;
        
        // Retrieve current balance
        let caller_balance: u64 = Mapping::get(balances, caller);
        
        // Ensure caller has sufficient balance
        assert(caller_balance >= amount);
        
        // Update public balance
        Mapping::set(balances, caller, caller_balance - amount);
        
        // Create a new private token record
        return Token {
            owner: caller,
            amount: amount,
            metadata: TOKEN_SYMBOL,
        };
    }
    
    // Convert private tokens to public tokens
    transition unshield(token: Token, public amount: u64) -> Token {
        // Get caller's address
        let caller: address = self.caller;
        
        // Ensure the token has sufficient balance
        assert(token.amount >= amount);
        
        // Retrieve current public balance
        let caller_balance: u64 = Mapping::get_or_use(balances, caller, 0u64);
        
        // Update public balance
        Mapping::set(balances, caller, caller_balance + amount);
        
        // Create a change token
        let change_token: Token = Token {
            owner: caller,
            amount: token.amount - amount,
            metadata: token.metadata,
        };
        
        return change_token;
    }
    
    // Burn public tokens
    transition burn_public(public amount: u64) {
        // Get caller's address
        let caller: address = self.caller;
        
        // Retrieve current balance
        let caller_balance: u64 = Mapping::get(balances, caller);
        
        // Ensure caller has sufficient balance
        assert(caller_balance >= amount);
        
        // Update balance
        Mapping::set(balances, caller, caller_balance - amount);
        
        // Update total supply
        let current_supply: u64 = Mapping::get(total_supply, TOKEN_SYMBOL);
        Mapping::set(total_supply, TOKEN_SYMBOL, current_supply - amount);
        
        return;
    }
    
    // Burn private tokens
    transition burn_private(token: Token, public amount: u64) -> Token {
        // Ensure the token has sufficient balance
        assert(token.amount >= amount);
        
        // Update total supply
        let current_supply: u64 = Mapping::get(total_supply, TOKEN_SYMBOL);
        Mapping::set(total_supply, TOKEN_SYMBOL, current_supply - amount);
        
        // Create a change token if not burning the entire amount
        let change_token: Token = Token {
            owner: token.owner,
            amount: token.amount - amount,
            metadata: token.metadata,
        };
        
        return change_token;
    }
    
    // Get public balance for an address
    function get_public_balance(public address: address) -> u64 {
        return Mapping::get_or_use(balances, address, 0u64);
    }
    
    // Get total token supply
    function get_total_supply() -> u64 {
        return Mapping::get(total_supply, TOKEN_SYMBOL);
    }
}