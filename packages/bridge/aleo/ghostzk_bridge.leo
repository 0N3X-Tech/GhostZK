program ghostzk_bridge.aleo {
    // Import the GhostZK token program
    import ghostzk_token.aleo;

    // Record to track bridged assets
    record BridgeMintAuthority {
        owner: address,
        amount: u64,
        bridge_tx_id: field,
    }

    // Structure to represent a bridge transaction
    struct BridgeTransaction {
        from_address: address,
        to_chain_address: field,  // Ethereum address as field
        amount: u64,
        fee: u64,
        timestamp: u32,
        status: u8,  // 0: pending, 1: completed, 2: failed
    }

    // Mapping to track processed Ethereum transactions
    mapping eth_tx_processed: field => bool;
    
    // Mapping to track processed Aleo transactions
    mapping aleo_tx_processed: field => bool;
    
    // Mapping to store bridge transactions
    mapping bridge_txs: field => BridgeTransaction;
    
    // Bridge parameters
    mapping bridge_params: u8 => u64;
    // bridge_params key definition:
    // 0: min_transfer_amount
    // 1: max_transfer_amount
    // 2: bridge_fee_basis_points (fee percentage * 100)
    // 3: paused (0 for active, 1 for paused)

    // Bridge operators - authorized to process cross-chain transactions
    mapping operators: address => bool;

    // Bridge owner - can update parameters and add/remove operators
    mapping owner: address => bool;

    // Initialize the bridge
    transition initialize(
        public owner_address: address,
        public min_amount: u64,
        public max_amount: u64,
        public fee_basis_points: u64
    ) {
        assert_eq(self.caller, aleo1yhk8ygk5p8zescctvylvxj8ckfktmlj89z8vgx8ejwr3nmurfq9sshkpwq);
        
        return then finalize(owner_address, min_amount, max_amount, fee_basis_points);
    }

    finalize initialize(
        owner_address: address,
        min_amount: u64,
        max_amount: u64,
        fee_basis_points: u64
    ) {
        // Set owner
        owner.set(owner_address, true);
        
        // Set bridge parameters
        bridge_params.set(0u8, min_amount);
        bridge_params.set(1u8, max_amount);
        bridge_params.set(2u8, fee_basis_points);
        bridge_params.set(3u8, 0u64); // Not paused
    }

    // Add an operator
    transition add_operator(public operator_address: address) {
        return then finalize(self.caller, operator_address);
    }

    finalize add_operator(caller: address, operator_address: address) {
        // Check if caller is owner
        let is_owner: bool = owner.get(caller);
        assert(is_owner);
        
        // Set operator
        operators.set(operator_address, true);
    }

    // Remove an operator
    transition remove_operator(public operator_address: address) {
        return then finalize(self.caller, operator_address);
    }

    finalize remove_operator(caller: address, operator_address: address) {
        // Check if caller is owner
        let is_owner: bool = owner.get(caller);
        assert(is_owner);
        
        // Remove operator
        operators.set(operator_address, false);
    }

    // Lock tokens to bridge from Aleo to Ethereum
    transition lock_tokens_to_ethereum(
        token_record: ghostzk_token.aleo.Token,
        public eth_recipient: field,
        public amount: u64
    ) -> ghostzk_token.aleo.Token {
        // Check if bridge is paused
        return then finalize(self.caller, eth_recipient, amount, token_record.amount);
    }

    finalize lock_tokens_to_ethereum(
        sender: address,
        eth_recipient: field,
        amount: u64,
        token_amount: u64
    ) {
        // Check if bridge is paused
        let paused: u64 = bridge_params.get(3u8);
        assert_eq(paused, 0u64);
        
        // Check amount limits
        let min_amount: u64 = bridge_params.get(0u8);
        let max_amount: u64 = bridge_params.get(1u8);
        assert(amount >= min_amount);
        assert(amount <= max_amount);
        assert(amount <= token_amount);
        
        // Calculate fee
        let fee_basis_points: u64 = bridge_params.get(2u8);
        let fee: u64 = (amount * fee_basis_points) / 10000u64;
        let transfer_amount: u64 = amount - fee;
        
        // Generate transaction ID
        let tx_id: field = BHP256::hash_to_field(sender);
        
        // Ensure this transaction hasn't been processed
        let processed: bool = aleo_tx_processed.get_or_use(tx_id, false);
        assert_eq(processed, false);
        aleo_tx_processed.set(tx_id, true);
        
        // Store bridge transaction
        let bridge_tx: BridgeTransaction = BridgeTransaction {
            from_address: sender,
            to_chain_address: eth_recipient,
            amount: transfer_amount,
            fee: fee,
            timestamp: block.height as u32,
            status: 0u8, // Pending
        };
        
        bridge_txs.set(tx_id, bridge_tx);
    }

    // Process tokens from Ethereum to Aleo
    transition process_ethereum_to_aleo(
        public eth_tx_id: field,
        public recipient: address,
        public amount: u64
    ) -> BridgeMintAuthority {
        // Verify the caller is an operator
        return then finalize(self.caller, eth_tx_id, recipient, amount);
    }

    finalize process_ethereum_to_aleo(
        caller: address,
        eth_tx_id: field,
        recipient: address,
        amount: u64
    ) {
        // Check if bridge is paused
        let paused: u64 = bridge_params.get(3u8);
        assert_eq(paused, 0u64);
        
        // Verify caller is an operator
        let is_operator: bool = operators.get_or_use(caller, false);
        assert(is_operator);
        
        // Ensure this Ethereum transaction hasn't been processed
        let processed: bool = eth_tx_processed.get_or_use(eth_tx_id, false);
        assert_eq(processed, false);
        eth_tx_processed.set(eth_tx_id, true);
    }

    // Mint tokens for a recipient after bridging from Ethereum
    transition mint_bridged_tokens(
        authority: BridgeMintAuthority
    ) -> ghostzk_token.aleo.Token {
        // Mint tokens using GhostZK Token program
        let token: ghostzk_token.aleo.Token = ghostzk_token.aleo.mint(authority.amount);
        
        return token;
    }

    // Update bridge parameters
    transition update_parameters(
        public min_amount: u64,
        public max_amount: u64,
        public fee_basis_points: u64
    ) {
        return then finalize(self.caller, min_amount, max_amount, fee_basis_points);
    }

    finalize update_parameters(
        caller: address,
        min_amount: u64,
        max_amount: u64,
        fee_basis_points: u64
    ) {
        // Check if caller is owner
        let is_owner: bool = owner.get(caller);
        assert(is_owner);
        
        // Validate parameters
        assert(min_amount > 0u64);
        assert(max_amount > min_amount);
        assert(fee_basis_points <= 500u64); // Max 5% fee
        
        // Update parameters
        bridge_params.set(0u8, min_amount);
        bridge_params.set(1u8, max_amount);
        bridge_params.set(2u8, fee_basis_points);
    }

    // Pause the bridge
    transition pause_bridge() {
        return then finalize(self.caller);
    }

    finalize pause_bridge(caller: address) {
        // Check if caller is owner
        let is_owner: bool = owner.get(caller);
        assert(is_owner);
        
        // Set paused state
        bridge_params.set(3u8, 1u64);
    }

    // Unpause the bridge
    transition unpause_bridge() {
        return then finalize(self.caller);
    }

    finalize unpause_bridge(caller: address) {
        // Check if caller is owner
        let is_owner: bool = owner.get(caller);
        assert(is_owner);
        
        // Set active state
        bridge_params.set(3u8, 0u64);
    }

    // Set transaction status (for monitoring)
    transition set_transaction_status(
        public tx_id: field,
        public status: u8
    ) {
        return then finalize(self.caller, tx_id, status);
    }

    finalize set_transaction_status(
        caller: address,
        tx_id: field,
        status: u8
    ) {
        // Check if caller is operator
        let is_operator: bool = operators.get_or_use(caller, false);
        assert(is_operator);
        
        // Get the transaction
        let tx: BridgeTransaction = bridge_txs.get(tx_id);
        
        // Update the status
        let updated_tx: BridgeTransaction = BridgeTransaction {
            from_address: tx.from_address,
            to_chain_address: tx.to_chain_address,
            amount: tx.amount,
            fee: tx.fee,
            timestamp: tx.timestamp,
            status: status
        };
        
        bridge_txs.set(tx_id, updated_tx);
    }
}