// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title GhostToken
 * @dev ERC20 Token for GhostZK cross-chain bridge
 */
contract GhostToken is ERC20, ERC20Burnable, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");

    uint8 private _decimals = 18;
    
    // Events
    event BridgeMint(address indexed to, uint256 amount, bytes32 indexed transactionHash);
    event BridgeBurn(address indexed from, uint256 amount, bytes32 indexed transactionHash);

    /**
     * @dev Constructor that gives msg.sender all existing roles.
     */
    constructor() ERC20("GhostZK Token", "GHOST") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BRIDGE_ROLE, msg.sender);
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Pauses all token transfers.
     * Requirements:
     * - the caller must have the `PAUSER_ROLE`.
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses all token transfers.
     * Requirements:
     * - the caller must have the `PAUSER_ROLE`.
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Creates `amount` new tokens for `to`.
     * Requirements:
     * - the caller must have the `MINTER_ROLE`.
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev Mints tokens for bridge transfers from Aleo to Ethereum
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     * @param transactionHash The Aleo transaction hash for reference
     * Requirements:
     * - the caller must have the `BRIDGE_ROLE`.
     */
    function bridgeMint(address to, uint256 amount, bytes32 transactionHash) 
        public 
        onlyRole(BRIDGE_ROLE) 
        returns (bool)
    {
        _mint(to, amount);
        emit BridgeMint(to, amount, transactionHash);
        return true;
    }

    /**
     * @dev Burns tokens for bridge transfers from Ethereum to Aleo
     * @param from The address that will have tokens burned
     * @param amount The amount of tokens to burn
     * @param transactionHash A unique identifier for this bridge transaction
     * Requirements:
     * - the caller must have the `BRIDGE_ROLE`.
     * - `from` must have at least `amount` tokens.
     */
    function bridgeBurn(address from, uint256 amount, bytes32 transactionHash) 
        public 
        onlyRole(BRIDGE_ROLE) 
        returns (bool)
    {
        _burn(from, amount);
        emit BridgeBurn(from, amount, transactionHash);
        return true;
    }

    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     * Requirements:
     * - the contract must not be paused.
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}