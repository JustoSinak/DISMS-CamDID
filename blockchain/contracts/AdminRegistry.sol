// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract AdminRegistry is AccessControl, Pausable {
    bytes32 public constant SUPER_ADMIN_ROLE = keccak256("SUPER_ADMIN_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    event AdminAdded(address indexed admin, bytes32 role, uint256 timestamp);
    event AdminRemoved(address indexed admin, bytes32 role, uint256 timestamp);
    event IssuerAdded(address indexed issuer, uint256 timestamp);
    event IssuerRemoved(address indexed issuer, uint256 timestamp);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(SUPER_ADMIN_ROLE, msg.sender);
    }

    modifier onlySuperAdmin() {
        require(hasRole(SUPER_ADMIN_ROLE, msg.sender), "Caller is not a super admin");
        _;
    }

    // Add a new admin
    function addAdmin(address account) external onlySuperAdmin {
        require(account != address(0), "Invalid address");
        require(!hasRole(ADMIN_ROLE, account), "Account is already an admin");

        grantRole(ADMIN_ROLE, account);
        emit AdminAdded(account, ADMIN_ROLE, block.timestamp);
    }

    // Remove an admin
    function removeAdmin(address account) external onlySuperAdmin {
        require(hasRole(ADMIN_ROLE, account), "Account is not an admin");
        require(account != msg.sender, "Cannot remove self");

        revokeRole(ADMIN_ROLE, account);
        emit AdminRemoved(account, ADMIN_ROLE, block.timestamp);
    }

    // Add a new issuer
    function addIssuer(address account) external {
        require(hasRole(SUPER_ADMIN_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), 
                "Caller is not authorized");
        require(account != address(0), "Invalid address");
        require(!hasRole(ISSUER_ROLE, account), "Account is already an issuer");

        grantRole(ISSUER_ROLE, account);
        emit IssuerAdded(account, block.timestamp);
    }

    // Remove an issuer
    function removeIssuer(address account) external {
        require(hasRole(SUPER_ADMIN_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), 
                "Caller is not authorized");
        require(hasRole(ISSUER_ROLE, account), "Account is not an issuer");

        revokeRole(ISSUER_ROLE, account);
        emit IssuerRemoved(account, block.timestamp);
    }

    // Check if an address has admin role
    function isAdmin(address account) external view returns (bool) {
        return hasRole(ADMIN_ROLE, account) || hasRole(SUPER_ADMIN_ROLE, account);
    }

    // Check if an address has super admin role
    function isSuperAdmin(address account) external view returns (bool) {
        return hasRole(SUPER_ADMIN_ROLE, account);
    }

    // Check if an address has issuer role
    function isIssuer(address account) external view returns (bool) {
        return hasRole(ISSUER_ROLE, account);
    }

    // Pause all contract operations
    function pause() external onlySuperAdmin {
        _pause();
    }

    // Unpause all contract operations
    function unpause() external onlySuperAdmin {
        _unpause();
    }
} 