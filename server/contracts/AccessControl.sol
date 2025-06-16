pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract AccessControl is AccessControl, Pausable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    event ContractPaused(address indexed account);
    event ContractUnpaused(address indexed account);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
        _setupRole(ISSUER_ROLE, msg.sender);
        _setupRole(VERIFIER_ROLE, msg.sender);
    }

    modifier onlyIssuer() {
        require(hasRole(ISSUER_ROLE, msg.sender), "Caller is not an issuer");
        _;
    }

    modifier onlyVerifier() {
        require(hasRole(VERIFIER_ROLE, msg.sender), "Caller is not a verifier");
        _;
    }

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _;
    }

    // Pause contract in case of emergency
    function pause() external onlyAdmin {
        _pause();
        emit ContractPaused(msg.sender);
    }

    // Unpause contract
    function unpause() external onlyAdmin {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }

    // Grant issuer role
    function grantIssuerRole(address account) external onlyAdmin {
        grantRole(ISSUER_ROLE, account);
        emit RoleGranted(ISSUER_ROLE, account, msg.sender);
    }

    // Revoke issuer role
    function revokeIssuerRole(address account) external onlyAdmin {
        revokeRole(ISSUER_ROLE, account);
        emit RoleRevoked(ISSUER_ROLE, account, msg.sender);
    }

    // Grant verifier role
    function grantVerifierRole(address account) external onlyAdmin {
        grantRole(VERIFIER_ROLE, account);
        emit RoleGranted(VERIFIER_ROLE, account, msg.sender);
    }

    // Revoke verifier role
    function revokeVerifierRole(address account) external onlyAdmin {
        revokeRole(VERIFIER_ROLE, account);
        emit RoleRevoked(VERIFIER_ROLE, account, msg.sender);
    }

    // Check if address has issuer role
    function isIssuer(address account) external view returns (bool) {
        return hasRole(ISSUER_ROLE, account);
    }

    // Check if address has verifier role
    function isVerifier(address account) external view returns (bool) {
        return hasRole(VERIFIER_ROLE, account);
    }

    // Check if address has admin role
    function isAdmin(address account) external view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }
}
