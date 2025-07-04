// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;
// CredentialVerifier.sol - Credential management contract
import "./IdentityRegistry.sol";
import "./CredentialMetadataStore.sol";

contract CredentialVerifier {
    // using CredentialTypes for CredentialTypes.CredentialType;  // Removed due to refactor
    
    IdentityRegistry public identityRegistry;
    CredentialMetadataStore public credentialMetadataStore;
    
    struct Credential {
        bytes32 credentialHash;
        address issuer;
        address holder;
        CredentialTypes.CredentialType credentialType;
        string metadataURI; // IPFS hash for credential details
        uint256 issuedAt;
        uint256 expiresAt;
        bool revoked;
        bool active;
        bytes[] proofs; // Zero-knowledge proofs
        mapping(address => bool) verifications; // Track who has verified this credential
    }
    
    mapping(bytes32 => Credential) public credentials;
    mapping(address => bytes32[]) public holderCredentials;
    mapping(address => bytes32[]) public issuerCredentials;
    mapping(address => bool) public authorizedIssuers;
    mapping(CredentialTypes.CredentialType => mapping(address => bool)) public authorizedIssuersByType;
    mapping(address => mapping(bytes32 => bool)) public credentialRequests; // holder -> hash -> verified
    mapping(address => mapping(bytes32 => uint256)) public verificationTimestamps; // verifier -> hash -> timestamp
    
    address public admin;
    
    event CredentialIssued(
        bytes32 indexed credentialHash,
        address indexed holder,
        address indexed issuer,
        string credentialType
    );
    
    event VerificationRequested(
        bytes32 indexed credentialHash,
        address indexed holder,
        address indexed verifier
    );
    
    event CredentialVerified(
        bytes32 indexed credentialHash,
        address indexed verifier,
        uint256 timestamp
    );
    
    event CredentialUpdated(
        bytes32 indexed credentialHash,
        string newMetadataURI
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

    modifier onlyAuthorizedForType(CredentialTypes.CredentialType _type) {
        require(authorizedIssuersByType[_type][msg.sender], "Not authorized for this credential type");
        _;
    }

    modifier onlyHolder(bytes32 _credentialHash) {
        require(credentials[_credentialHash].holder == msg.sender, "Not credential holder");
        _;
    }

    modifier credentialActive(bytes32 _credentialHash) {
        require(credentials[_credentialHash].active, "Credential not active");
        require(!credentials[_credentialHash].revoked, "Credential revoked");
        require(block.timestamp <= credentials[_credentialHash].expiresAt, "Credential expired");
        _;
    }

    modifier notAlreadyVerified(address _verifier, bytes32 _credentialHash) {
        require(!credentials[_credentialHash].verifications[_verifier], "Already verified");
        _;
    }
    
    constructor(address _identityRegistryAddress, address _credentialMetadataStoreAddress) {
        identityRegistry = IdentityRegistry(_identityRegistryAddress);
        credentialMetadataStore = CredentialMetadataStore(_credentialMetadataStoreAddress);
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
        
        emit CredentialIssued(
            _credentialHash,
            _holder,
            msg.sender,
            credentialMetadataStore.getCredentialMetadata(CredentialTypes.CredentialType(uint8(keccak256(abi.encodePacked(_credentialType))))).name
        );
        
        return _credentialHash;
    }

    function requestVerification(
        bytes32 _credentialHash,
        address _verifier,
        bytes[] memory _proofs
    )
        external
        onlyHolder(_credentialHash)
        credentialActive(_credentialHash)
        returns (bool)
    {
        require(_verifier != address(0), "Invalid verifier address");
        require(!credentialRequests[_verifier][_credentialHash], "Verification already requested");
        
        credentialRequests[_verifier][_credentialHash] = true;
        credentials[_credentialHash].proofs.push(_proofs);
        
        emit VerificationRequested(_credentialHash, msg.sender, _verifier);
        return true;
    }

    function verifyCredential(
        bytes32 _credentialHash,
        address _verifier
    )
        external
        onlyAuthorizedIssuer()
        credentialActive(_credentialHash)
        notAlreadyVerified(_verifier, _credentialHash)
        returns (bool)
    {
        require(credentialRequests[_verifier][_credentialHash], "No verification request found");
        
        credentials[_credentialHash].verifications[_verifier] = true;
        verificationTimestamps[_verifier][_credentialHash] = block.timestamp;
        
        emit CredentialVerified(_credentialHash, _verifier, block.timestamp);
        return true;
    }

    function revokeCredential(
        bytes32 _credentialHash
    )
        external
        onlyAuthorizedIssuer()
        returns (bool)
    {
        require(credentials[_credentialHash].issuer == msg.sender, "Not issuer");
        require(credentials[_credentialHash].active, "Credential not active");
        
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