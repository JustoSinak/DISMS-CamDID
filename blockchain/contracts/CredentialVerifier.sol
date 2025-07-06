// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./IdentityRegistry.sol";
import "./CredentialMetadataStore.sol";
import "./libraries/CredentialTypes.sol";

// CredentialVerifier.sol - Enhanced credential management contract based on PRD
contract CredentialVerifier is ReentrancyGuard, AccessControl, Pausable {
    using CredentialTypes for CredentialTypes.CredentialType;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

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
        uint256 revokedAt;
        bool revoked;
        bool active;
        bool requiresBiometric;
        uint8 verificationLevel; // Required verification level for holder
        bytes32 schemaHash; // Hash of the credential schema
        bytes[] proofs; // Zero-knowledge proofs
        mapping(address => bool) verifications; // Track who has verified this credential
        mapping(address => uint256) verificationTimestamps; // When each verifier verified
        mapping(bytes32 => bool) attributeHashes; // Selective disclosure attributes
    }

    struct VerificationRequest {
        bytes32 credentialHash;
        address requester;
        address holder;
        string purpose;
        bytes32[] requestedAttributes;
        uint256 requestedAt;
        uint256 expiresAt;
        bool approved;
        bool completed;
    }

    struct ShareSession {
        bytes32 credentialHash;
        address sharer;
        address recipient;
        bytes32[] revealedAttributes;
        uint256 expiresAt;
        uint256 maxUses;
        uint256 currentUses;
        bool active;
    }
    
    mapping(bytes32 => Credential) public credentials;
    mapping(address => bytes32[]) public holderCredentials;
    mapping(address => bytes32[]) public issuerCredentials;
    mapping(address => bool) public authorizedIssuers;
    mapping(CredentialTypes.CredentialType => mapping(address => bool)) public authorizedIssuersByType;
    mapping(address => mapping(bytes32 => bool)) public credentialRequests; // holder -> hash -> verified
    mapping(address => mapping(bytes32 => uint256)) public verificationTimestamps; // verifier -> hash -> timestamp

    // Enhanced mappings for new features
    mapping(bytes32 => VerificationRequest) public verificationRequests;
    mapping(bytes32 => ShareSession) public shareSessions;
    mapping(address => bytes32[]) public userVerificationRequests;
    mapping(bytes32 => bytes32[]) public credentialSchemas; // credential type -> schema hashes
    mapping(bytes32 => bool) public revokedCredentials;
    mapping(address => mapping(CredentialTypes.CredentialType => uint256)) public issuerCredentialCounts;
    mapping(address => uint256) public holderVerificationLevel;

    // Revocation registry
    mapping(bytes32 => mapping(uint256 => bool)) public revocationRegistry; // credentialHash -> index -> revoked
    mapping(bytes32 => uint256) public revocationIndex; // credentialHash -> current index

    uint256 public totalCredentials;
    uint256 public totalVerifications;
    uint256 public requestCounter;
    
    // Enhanced events
    event CredentialIssued(
        bytes32 indexed credentialHash,
        address indexed holder,
        address indexed issuer,
        CredentialTypes.CredentialType credentialType,
        uint256 expiresAt,
        uint256 timestamp
    );

    event VerificationRequested(
        bytes32 indexed requestId,
        bytes32 indexed credentialHash,
        address indexed requester,
        address holder,
        string purpose
    );

    event CredentialVerified(
        bytes32 indexed credentialHash,
        address indexed verifier,
        address indexed holder,
        uint8 verificationLevel,
        uint256 timestamp
    );

    event CredentialUpdated(
        bytes32 indexed credentialHash,
        string newMetadataURI,
        uint256 timestamp
    );

    event CredentialRevoked(
        bytes32 indexed credentialHash,
        address indexed issuer,
        string reason,
        uint256 timestamp
    );

    event CredentialShared(
        bytes32 indexed credentialHash,
        address indexed sharer,
        address indexed recipient,
        bytes32 sessionId,
        uint256 expiresAt
    );

    event SelectiveDisclosureProofGenerated(
        bytes32 indexed credentialHash,
        address indexed holder,
        bytes32[] revealedAttributes,
        uint256 timestamp
    );

    event SchemaRegistered(
        bytes32 indexed schemaHash,
        CredentialTypes.CredentialType credentialType,
        string schemaURI
    );

    event IssuerAuthorized(
        address indexed issuer,
        CredentialTypes.CredentialType[] credentialTypes
    );

    event IssuerDeauthorized(
        address indexed issuer,
        CredentialTypes.CredentialType[] credentialTypes
    );

    event VerificationRequestApproved(
        bytes32 indexed requestId,
        bytes32 indexed credentialHash,
        bytes32[] revealedAttributes
    );

    event VerificationRequestRejected(
        bytes32 indexed requestId,
        string reason
    );
    
    modifier onlyAuthorizedIssuer() {
        require(hasRole(ISSUER_ROLE, msg.sender) || authorizedIssuers[msg.sender], "Not an authorized issuer");
        _;
    }

    modifier onlyAuthorizedForType(CredentialTypes.CredentialType _type) {
        require(
            hasRole(ISSUER_ROLE, msg.sender) || authorizedIssuersByType[_type][msg.sender],
            "Not authorized for this credential type"
        );
        _;
    }

    modifier onlyHolder(bytes32 _credentialHash) {
        require(credentials[_credentialHash].holder == msg.sender, "Not credential holder");
        _;
    }

    modifier onlyHolderOrDelegate(bytes32 _credentialHash) {
        address holder = credentials[_credentialHash].holder;
        require(
            msg.sender == holder || identityRegistry.isDelegate(holder, msg.sender),
            "Not credential holder or delegate"
        );
        _;
    }

    modifier credentialExists(bytes32 _credentialHash) {
        require(credentials[_credentialHash].credentialHash != bytes32(0), "Credential does not exist");
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

    modifier validVerificationLevel(uint8 _level) {
        require(_level <= 5, "Invalid verification level");
        _;
    }

    constructor(address _identityRegistryAddress, address _credentialMetadataStoreAddress) {
        identityRegistry = IdentityRegistry(_identityRegistryAddress);
        credentialMetadataStore = CredentialMetadataStore(_credentialMetadataStoreAddress);

        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);

        // Admin is automatically an authorized issuer
        authorizedIssuers[msg.sender] = true;

        totalCredentials = 0;
        totalVerifications = 0;
        requestCounter = 0;
    }
    
    // Authorize an issuer
    function authorizeIssuer(address _issuer) public onlyRole(ADMIN_ROLE) {
        authorizedIssuers[_issuer] = true;
        CredentialTypes.CredentialType[] memory emptyTypes = new CredentialTypes.CredentialType[](0);
        emit IssuerAuthorized(_issuer, emptyTypes);
    }

    // Deauthorize an issuer
    function deauthorizeIssuer(address _issuer) public onlyRole(ADMIN_ROLE) {
        authorizedIssuers[_issuer] = false;
        CredentialTypes.CredentialType[] memory emptyTypes = new CredentialTypes.CredentialType[](0);
        emit IssuerDeauthorized(_issuer, emptyTypes);
    }

    // Issue a new credential
    function issueCredential(
        address _holder,
        bytes32 _credentialHash,
        CredentialTypes.CredentialType _credentialType,
        string memory _metadataURI,
        uint256 _expiresAt
    ) public onlyAuthorizedIssuer returns (bytes32) {
        // Check if holder has an active identity
        bool active = identityRegistry.verifyIdentity(_holder);
        require(active, "Holder does not have an active identity");
        
        require(credentials[_credentialHash].credentialHash == bytes32(0), "Credential already exists");
        require(_expiresAt > block.timestamp, "Expiration date must be in the future");
        
        Credential storage newCredential = credentials[_credentialHash];
        newCredential.credentialHash = _credentialHash;
        newCredential.issuer = msg.sender;
        newCredential.holder = _holder;
        newCredential.credentialType = _credentialType;
        newCredential.metadataURI = _metadataURI;
        newCredential.issuedAt = block.timestamp;
        newCredential.expiresAt = _expiresAt;
        newCredential.revoked = false;
        newCredential.active = true;
        
        holderCredentials[_holder].push(_credentialHash);
        issuerCredentials[msg.sender].push(_credentialHash);
        
        emit CredentialIssued(
            _credentialHash,
            _holder,
            msg.sender,
            _credentialType,
            _expiresAt,
            block.timestamp
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

        // Add each proof to the credential's proofs array
        for (uint256 i = 0; i < _proofs.length; i++) {
            credentials[_credentialHash].proofs.push(_proofs[i]);
        }
        
        bytes32 requestId = keccak256(abi.encodePacked(_credentialHash, _verifier, block.timestamp));
        emit VerificationRequested(requestId, _credentialHash, msg.sender, credentials[_credentialHash].holder, "Verification requested");
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
        
        emit CredentialVerified(_credentialHash, _verifier, credentials[_credentialHash].holder, 1, block.timestamp);
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
        
        emit CredentialRevoked(_credentialHash, msg.sender, "Revoked by issuer", block.timestamp);
    }
    
    // Verify a credential
    function verifyCredential(bytes32 _credentialHash) public view returns (bool) {
        Credential storage cred = credentials[_credentialHash];
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
        CredentialTypes.CredentialType credentialType,
        string memory metadataURI,
        uint256 issuedAt,
        uint256 expiresAt,
        bool revoked,
        bool active
    ) {
        Credential storage cred = credentials[_credentialHash];
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