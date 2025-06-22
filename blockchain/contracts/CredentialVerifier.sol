// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;
// CredentialVerifier.sol - Credential management contract
import "./IdentityRegistry.sol";

contract CredentialVerifier {
    IdentityRegistry public identityRegistry;
    
    struct Credential {
        bytes32 credentialHash;
        address issuer;
        address holder;
        string credentialType; // e.g., "education", "employment", "license"
        string metadataURI; // IPFS hash for credential details
        uint256 issuedAt;
        uint256 expiresAt;
        bool revoked;
        bool active;
    }
    
    mapping(bytes32 => Credential) public credentials;
    mapping(address => bytes32[]) public holderCredentials;
    mapping(address => bytes32[]) public issuerCredentials;
    mapping(address => bool) public authorizedIssuers;
    
    address public admin;
    
    event CredentialIssued(
        bytes32 indexed credentialHash,
        address indexed holder,
        address indexed issuer,
        string credentialType
    );
    
    event CredentialRevoked(
        bytes32 indexed credentialHash,
        address indexed issuer
    );
    
    event IssuerAuthorized(address indexed issuer);
    event IssuerDeauthorized(address indexed issuer);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not an authorized issuer");
        _;
    }
    
    constructor(address _identityRegistryAddress) {
        identityRegistry = IdentityRegistry(_identityRegistryAddress);
        admin = msg.sender;
        // Admin is automatically an authorized issuer
        authorizedIssuers[msg.sender] = true;
    }
    
    // Authorize an issuer
    function authorizeIssuer(address _issuer) public onlyAdmin {
        authorizedIssuers[_issuer] = true;
        emit IssuerAuthorized(_issuer);
    }
    
    // Issue a new credential
    function issueCredential(
        address _holder,
        bytes32 _credentialHash,
        string memory _credentialType,
        string memory _metadataURI,
        uint256 _expiresAt
    ) public onlyAuthorizedIssuer {
        // Check if holder has an active identity
        bool active = identityRegistry.verifyIdentity(_holder);
        require(active, "Holder does not have an active identity");
        
        require(credentials[_credentialHash].credentialHash == bytes32(0), "Credential already exists");
        require(_expiresAt > block.timestamp, "Expiration date must be in the future");
        
        credentials[_credentialHash] = Credential({
            credentialHash: _credentialHash,
            issuer: msg.sender,
            holder: _holder,
            credentialType: _credentialType,
            metadataURI: _metadataURI,
            issuedAt: block.timestamp,
            expiresAt: _expiresAt,
            revoked: false,
            active: true
        });
        
        holderCredentials[_holder].push(_credentialHash);
        issuerCredentials[msg.sender].push(_credentialHash);
        
        emit CredentialIssued(_credentialHash, _holder, msg.sender, _credentialType);
    }
    
    // Revoke a credential
    function revokeCredential(bytes32 _credentialHash) public {
        require(credentials[_credentialHash].issuer == msg.sender, "Only issuer can revoke");
        require(!credentials[_credentialHash].revoked, "Credential already revoked");
        
        credentials[_credentialHash].revoked = true;
        credentials[_credentialHash].active = false;
        
        emit CredentialRevoked(_credentialHash, msg.sender);
    }
    
    // Verify a credential
    function verifyCredential(bytes32 _credentialHash) public view returns (bool) {
        Credential memory cred = credentials[_credentialHash];
        return (
            cred.active &&
            !cred.revoked &&
            cred.expiresAt > block.timestamp &&
            authorizedIssuers[cred.issuer]
        );
    }
    
    // Get credential details
    function getCredential(bytes32 _credentialHash) public view returns (
        address issuer,
        address holder,
        string memory credentialType,
        string memory metadataURI,
        uint256 issuedAt,
        uint256 expiresAt,
        bool revoked,
        bool active
    ) {
        Credential memory cred = credentials[_credentialHash];
        return (
            cred.issuer,
            cred.holder,
            cred.credentialType,
            cred.metadataURI,
            cred.issuedAt,
            cred.expiresAt,
            cred.revoked,
            cred.active
        );
    }
    
    // Get all credentials for a holder
    function getHolderCredentials(address _holder) public view returns (bytes32[] memory) {
        return holderCredentials[_holder];
    }
}