// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title GhostBridge
 * @dev Bridge contract for cross-chain transfers between Ethereum and Aleo
 */
contract GhostBridge is Pausable, ReentrancyGuard, AccessControl {
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant BRIDGE_OPERATOR_ROLE = keccak256("BRIDGE_OPERATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");

    // Ghost token contract
    IERC20 public ghostToken;

    // Bridge parameters
    uint256 public minTransferAmount;
    uint256 public maxTransferAmount;
    uint256 public bridgeFeePercentage; // in basis points (1/100 of a percent)
    uint256 public constant MAX_FEE_PERCENTAGE = 500; // 5% maximum fee

    // Bridge state
    mapping(bytes32 => bool) public processedAleoTransactions;
    mapping(bytes32 => bool) public processedEthereumTransactions;

    // Events
    event TokensLocked(
        address indexed sender,
        string aleoRecipient,
        uint256 amount,
        uint256 fee,
        bytes32 indexed transactionHash
    );

    event TokensUnlocked(
        address indexed recipient,
        uint256 amount,
        bytes32 indexed aleoTransactionHash,
        bytes32 indexed bridgeTransactionId
    );

    event BridgeParametersUpdated(
        uint256 minTransferAmount,
        uint256 maxTransferAmount,
        uint256 bridgeFeePercentage
    );

    event BridgePaused(address account);
    event BridgeUnpaused(address account);

    /**
     * @dev Constructor
     * @param _ghostToken Address of the Ghost token contract
     * @param _minTransfer Minimum transfer amount
     * @param _maxTransfer Maximum transfer amount
     * @param _feePercentage Bridge fee percentage in basis points
     */
    constructor(
        address _ghostToken,
        uint256 _minTransfer,
        uint256 _maxTransfer,
        uint256 _feePercentage
    ) {
        require(_ghostToken != address(0), "Invalid token address");
        require(_feePercentage <= MAX_FEE_PERCENTAGE, "Fee exceeds maximum");
        require(_minTransfer > 0, "Min transfer must be > 0");
        require(_maxTransfer > _minTransfer, "Max must be > min");

        ghostToken = IERC20(_ghostToken);
        minTransferAmount = _minTransfer;
        maxTransferAmount = _maxTransfer;
        bridgeFeePercentage = _feePercentage;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BRIDGE_OPERATOR_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(FEE_MANAGER_ROLE, msg.sender);
    }

    /**
     * @dev Lock tokens to bridge from Ethereum to Aleo
     * @param aleoRecipient The Aleo address to receive tokens
     * @param amount The amount of tokens to transfer
     * @return transactionHash The hash of this transaction for tracking
     */
    function lockTokens(string memory aleoRecipient, uint256 amount)
        external
        nonReentrant
        whenNotPaused
        returns (bytes32 transactionHash)
    {
        require(amount >= minTransferAmount, "Below minimum transfer amount");
        require(amount <= maxTransferAmount, "Exceeds maximum transfer amount");
        require(bytes(aleoRecipient).length > 0, "Invalid Aleo recipient");

        // Calculate fee
        uint256 fee = (amount * bridgeFeePercentage) / 10000;
        uint256 transferAmount = amount - fee;

        // Generate unique transaction hash
        transactionHash = keccak256(
            abi.encodePacked(
                msg.sender,
                aleoRecipient,
                amount,
                block.timestamp,
                block.number
            )
        );

        // Ensure this transaction hasn't been processed before
        require(!processedEthereumTransactions[transactionHash], "Transaction already processed");
        processedEthereumTransactions[transactionHash] = true;

        // Transfer tokens from user to bridge contract
        ghostToken.safeTransferFrom(msg.sender, address(this), amount);

        emit TokensLocked(msg.sender, aleoRecipient, transferAmount, fee, transactionHash);
        return transactionHash;
    }

    /**
     * @dev Unlock tokens that were bridged from Aleo to Ethereum
     * @param recipient The Ethereum address to receive tokens
     * @param amount The amount of tokens to unlock
     * @param aleoTransactionHash The Aleo transaction hash for reference
     * @param bridgeTransactionId A unique identifier for this bridge transaction
     * Requirements:
     * - the caller must have the `BRIDGE_OPERATOR_ROLE`.
     */
    function unlockTokens(
        address recipient,
        uint256 amount,
        bytes32 aleoTransactionHash,
        bytes32 bridgeTransactionId
    )
        external
        nonReentrant
        whenNotPaused
        onlyRole(BRIDGE_OPERATOR_ROLE)
        returns (bool)
    {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");
        require(!processedAleoTransactions[aleoTransactionHash], "Transaction already processed");

        // Mark this Aleo transaction as processed
        processedAleoTransactions[aleoTransactionHash] = true;

        // Transfer tokens from bridge contract to recipient
        ghostToken.safeTransfer(recipient, amount);

        emit TokensUnlocked(recipient, amount, aleoTransactionHash, bridgeTransactionId);
        return true;
    }

    /**
     * @dev Update bridge parameters
     * @param _minTransfer New minimum transfer amount
     * @param _maxTransfer New maximum transfer amount
     * @param _feePercentage New bridge fee percentage in basis points
     */
    function updateBridgeParameters(
        uint256 _minTransfer,
        uint256 _maxTransfer,
        uint256 _feePercentage
    )
        external
        onlyRole(FEE_MANAGER_ROLE)
    {
        require(_feePercentage <= MAX_FEE_PERCENTAGE, "Fee exceeds maximum");
        require(_minTransfer > 0, "Min transfer must be > 0");
        require(_maxTransfer > _minTransfer, "Max must be > min");

        minTransferAmount = _minTransfer;
        maxTransferAmount = _maxTransfer;
        bridgeFeePercentage = _feePercentage;

        emit BridgeParametersUpdated(_minTransfer, _maxTransfer, _feePercentage);
    }

    /**
     * @dev Withdraw accumulated fees
     * @param recipient Address to receive the fees
     * @param amount Amount of fees to withdraw
     */
    function withdrawFees(address recipient, uint256 amount)
        external
        onlyRole(FEE_MANAGER_ROLE)
        returns (bool)
    {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");

        ghostToken.safeTransfer(recipient, amount);
        return true;
    }

    /**
     * @dev Check if an Aleo transaction has been processed
     * @param aleoTransactionHash The Aleo transaction hash to check
     * @return bool indicating if the transaction has been processed
     */
    function isAleoTransactionProcessed(bytes32 aleoTransactionHash)
        external
        view
        returns (bool)
    {
        return processedAleoTransactions[aleoTransactionHash];
    }

    /**
     * @dev Check if an Ethereum transaction has been processed
     * @param ethereumTransactionHash The Ethereum transaction hash to check
     * @return bool indicating if the transaction has been processed
     */
    function isEthereumTransactionProcessed(bytes32 ethereumTransactionHash)
        external
        view
        returns (bool)
    {
        return processedEthereumTransactions[ethereumTransactionHash];
    }

    /**
     * @dev Pause the bridge
     * Requirements:
     * - the caller must have the `PAUSER_ROLE`.
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
        emit BridgePaused(msg.sender);
    }

    /**
     * @dev Unpause the bridge
     * Requirements:
     * - the caller must have the `PAUSER_ROLE`.
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
        emit BridgeUnpaused(msg.sender);
    }

    /**
     * @dev Emergency function to recover any ERC20 tokens sent to this contract by mistake
     * @param tokenAddress Address of the token to recover
     * @param recipient Address to receive the recovered tokens
     * @param amount Amount of tokens to recover
     * Requirements:
     * - the caller must have the DEFAULT_ADMIN_ROLE.
     */
    function emergencyTokenRecovery(
        address tokenAddress,
        address recipient,
        uint256 amount
    )
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (bool)
    {
        require(recipient != address(0), "Invalid recipient address");
        
        IERC20 token = IERC20(tokenAddress);
        token.safeTransfer(recipient, amount);
        return true;
    }
}