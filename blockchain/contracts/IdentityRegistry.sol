// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

// IdentityRegistry.sol - Enhanced identity management contract based on PRD
contract IdentityRegistry is ReentrancyGuard, AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    struct Identity {
        address owner;
        bytes32 identityHash;
        string metadataURI; // IPFS hash for additional identity data
        uint256 createdAt;
        uint256 updatedAt;
        bool active;
        bool verified; // Government verification status
        uint8 verificationLevel; // 0-5 verification levels
        mapping(bytes32 => bool) attributeHashes; // Mapping of attribute hash to existence
        mapping(address => bool) delegates; // Authorized delegates
    }

    struct IdentityMetadata {
        string did; // Decentralized Identifier
        string publicKeyPem; // Public key for verification
        string[] serviceEndpoints; // Service endpoints
        uint256 nonce; // For replay protection
    }

    mapping(address => Identity) public identities;
    mapping(bytes32 => address) public identityHashToOwner;
    mapping(string => address) public didToOwner; // DID to owner mapping
    mapping(address => IdentityMetadata) public identityMetadata;
    mapping(address => uint256) public identityCount; // Track total identities per address

    // Recovery mechanism
    mapping(address => address[]) public recoveryGuardians;
    mapping(address => mapping(address => bool)) public recoveryApprovals;
    mapping(address => uint256) public recoveryThreshold;

    // Events
    event IdentityCreated(
        address indexed owner,
        bytes32 indexed identityHash,
        string did,
        uint256 timestamp
    );
    event IdentityUpdated(
        address indexed owner,
        bytes32 oldHash,
        bytes32 newHash,
        uint256 timestamp
    );
    event IdentityDeactivated(address indexed owner, uint256 timestamp);
    event IdentityVerified(
        address indexed owner,
        uint8 verificationLevel,
        address indexed verifier,
        uint256 timestamp
    );
    event DelegateAdded(address indexed owner, address indexed delegate);
    event DelegateRemoved(address indexed owner, address indexed delegate);
    event RecoveryInitiated(address indexed owner, address indexed initiator);
    event RecoveryCompleted(address indexed owner, bytes32 newIdentityHash);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    modifier onlyIdentityOwner(address _owner) {
        require(
            identities[_owner].owner == msg.sender ||
            identities[_owner].delegates[msg.sender],
            "Not identity owner or delegate"
        );
        _;
    }

    modifier identityExists(address _owner) {
        require(identities[_owner].owner != address(0), "Identity does not exist");
        _;
    }

    modifier identityActive(address _owner) {
        require(identities[_owner].active, "Identity is not active");
        _;
    }

    // Create a new identity with enhanced features
    function createIdentity(
        bytes32 _identityHash,
        string memory _did,
        string memory _metadataURI,
        string memory _publicKeyPem,
        string[] memory _serviceEndpoints
    ) external nonReentrant whenNotPaused {
        require(identities[msg.sender].owner == address(0), "Identity already exists");
        require(identityHashToOwner[_identityHash] == address(0), "Identity hash already used");
        require(didToOwner[_did] == address(0), "DID already registered");
        require(bytes(_did).length > 0, "DID cannot be empty");

        Identity storage id = identities[msg.sender];
        id.owner = msg.sender;
        id.identityHash = _identityHash;
        id.metadataURI = _metadataURI;
        id.createdAt = block.timestamp;
        id.updatedAt = block.timestamp;
        id.active = true;
        id.verified = false;
        id.verificationLevel = 0;

        identityHashToOwner[_identityHash] = msg.sender;
        didToOwner[_did] = msg.sender;
        identityCount[msg.sender] = 1;

        // Set identity metadata
        IdentityMetadata storage metadata = identityMetadata[msg.sender];
        metadata.did = _did;
        metadata.publicKeyPem = _publicKeyPem;
        metadata.serviceEndpoints = _serviceEndpoints;
        metadata.nonce = 0;

        emit IdentityCreated(msg.sender, _identityHash, _did, block.timestamp);
    }

    // Update identity hash with enhanced security
    function updateIdentity(
        bytes32 _newIdentityHash,
        string memory _newMetadataURI,
        uint256 _nonce,
        bytes memory _signature
    ) external nonReentrant whenNotPaused onlyIdentityOwner(msg.sender) identityActive(msg.sender) {
        require(identityHashToOwner[_newIdentityHash] == address(0), "New identity hash already used");
        require(_nonce > identityMetadata[msg.sender].nonce, "Invalid nonce");

        // Verify signature for additional security
        bytes32 messageHash = keccak256(abi.encodePacked(
            msg.sender,
            _newIdentityHash,
            _newMetadataURI,
            _nonce
        ));
        // Note: Signature verification would be implemented here in production

        bytes32 oldIdentityHash = identities[msg.sender].identityHash;

        // Update the identity struct
        identities[msg.sender].identityHash = _newIdentityHash;
        identities[msg.sender].metadataURI = _newMetadataURI;
        identities[msg.sender].updatedAt = block.timestamp;
        identityMetadata[msg.sender].nonce = _nonce;

        // Update the hash-to-owner mapping
        delete identityHashToOwner[oldIdentityHash];
        identityHashToOwner[_newIdentityHash] = msg.sender;

        emit IdentityUpdated(msg.sender, oldIdentityHash, _newIdentityHash, block.timestamp);
    }

    // Verify identity by authorized verifiers
    function verifyIdentity(
        address _owner,
        uint8 _verificationLevel,
        string memory _verificationData
    ) external onlyRole(VERIFIER_ROLE) identityExists(_owner) {
        require(_verificationLevel <= 5, "Invalid verification level");
        require(_verificationLevel > identities[_owner].verificationLevel, "Cannot downgrade verification");

        identities[_owner].verified = true;
        identities[_owner].verificationLevel = _verificationLevel;
        identities[_owner].updatedAt = block.timestamp;

        emit IdentityVerified(_owner, _verificationLevel, msg.sender, block.timestamp);
    }

    // Add delegate for identity management
    function addDelegate(address _delegate) external onlyIdentityOwner(msg.sender) identityActive(msg.sender) {
        require(_delegate != address(0), "Invalid delegate address");
        require(_delegate != msg.sender, "Cannot delegate to self");
        require(!identities[msg.sender].delegates[_delegate], "Already a delegate");

        identities[msg.sender].delegates[_delegate] = true;
        emit DelegateAdded(msg.sender, _delegate);
    }

    // Remove delegate
    function removeDelegate(address _delegate) external onlyIdentityOwner(msg.sender) {
        require(identities[msg.sender].delegates[_delegate], "Not a delegate");

        identities[msg.sender].delegates[_delegate] = false;
        emit DelegateRemoved(msg.sender, _delegate);
    }

    // Deactivate identity with enhanced security
    function deactivateIdentity(string memory _reason) external onlyIdentityOwner(msg.sender) identityActive(msg.sender) {
        identities[msg.sender].active = false;
        identities[msg.sender].updatedAt = block.timestamp;

        emit IdentityDeactivated(msg.sender, block.timestamp);
    }

    // Setup recovery guardians
    function setupRecovery(
        address[] memory _guardians,
        uint256 _threshold
    ) external onlyIdentityOwner(msg.sender) identityActive(msg.sender) {
        require(_guardians.length >= _threshold, "Threshold cannot exceed guardians count");
        require(_threshold > 0, "Threshold must be greater than 0");
        require(_guardians.length <= 10, "Too many guardians");

        // Clear existing guardians
        delete recoveryGuardians[msg.sender];

        // Set new guardians
        for (uint i = 0; i < _guardians.length; i++) {
            require(_guardians[i] != address(0), "Invalid guardian address");
            require(_guardians[i] != msg.sender, "Cannot be own guardian");
            recoveryGuardians[msg.sender].push(_guardians[i]);
        }

        recoveryThreshold[msg.sender] = _threshold;
    }

    // Initiate recovery process
    function initiateRecovery(address _owner) external {
        require(identities[_owner].owner != address(0), "Identity does not exist");

        bool isGuardian = false;
        address[] memory guardians = recoveryGuardians[_owner];
        for (uint i = 0; i < guardians.length; i++) {
            if (guardians[i] == msg.sender) {
                isGuardian = true;
                break;
            }
        }
        require(isGuardian, "Not a recovery guardian");

        recoveryApprovals[_owner][msg.sender] = true;
        emit RecoveryInitiated(_owner, msg.sender);
    }

    // Complete recovery with new identity hash
    function completeRecovery(
        address _owner,
        bytes32 _newIdentityHash,
        string memory _newDid
    ) external {
        require(identities[_owner].owner != address(0), "Identity does not exist");
        require(identityHashToOwner[_newIdentityHash] == address(0), "New identity hash already used");
        require(didToOwner[_newDid] == address(0), "New DID already registered");

        // Check if enough guardians approved
        uint256 approvals = 0;
        address[] memory guardians = recoveryGuardians[_owner];
        for (uint i = 0; i < guardians.length; i++) {
            if (recoveryApprovals[_owner][guardians[i]]) {
                approvals++;
            }
        }
        require(approvals >= recoveryThreshold[_owner], "Insufficient guardian approvals");

        // Update identity
        bytes32 oldHash = identities[_owner].identityHash;
        string memory oldDid = identityMetadata[_owner].did;

        identities[_owner].identityHash = _newIdentityHash;
        identities[_owner].updatedAt = block.timestamp;
        identityMetadata[_owner].did = _newDid;
        identityMetadata[_owner].nonce++;

        // Update mappings
        delete identityHashToOwner[oldHash];
        delete didToOwner[oldDid];
        identityHashToOwner[_newIdentityHash] = _owner;
        didToOwner[_newDid] = _owner;

        // Clear recovery approvals
        for (uint i = 0; i < guardians.length; i++) {
            recoveryApprovals[_owner][guardians[i]] = false;
        }

        emit RecoveryCompleted(_owner, _newIdentityHash);
    }

    // View functions
    function getIdentity(address _owner) external view returns (
        bytes32 identityHash,
        string memory metadataURI,
        uint256 createdAt,
        uint256 updatedAt,
        bool active,
        bool verified,
        uint8 verificationLevel
    ) {
        Identity storage identity = identities[_owner];
        return (
            identity.identityHash,
            identity.metadataURI,
            identity.createdAt,
            identity.updatedAt,
            identity.active,
            identity.verified,
            identity.verificationLevel
        );
    }

    function getIdentityMetadata(address _owner) external view returns (
        string memory did,
        string memory publicKeyPem,
        string[] memory serviceEndpoints,
        uint256 nonce
    ) {
        IdentityMetadata storage metadata = identityMetadata[_owner];
        return (
            metadata.did,
            metadata.publicKeyPem,
            metadata.serviceEndpoints,
            metadata.nonce
        );
    }

    function isDelegate(address _owner, address _delegate) external view returns (bool) {
        return identities[_owner].delegates[_delegate];
    }

    function getRecoveryGuardians(address _owner) external view returns (address[] memory) {
        return recoveryGuardians[_owner];
    }

    function getRecoveryThreshold(address _owner) external view returns (uint256) {
        return recoveryThreshold[_owner];
    }

    // Verify if an address has an active identity
    function verifyIdentity(address _owner) external view returns (bool) {
        return identities[_owner].active && identities[_owner].owner != address(0);
    }

    // Admin functions
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function grantVerifierRole(address _verifier) external onlyRole(ADMIN_ROLE) {
        _grantRole(VERIFIER_ROLE, _verifier);
    }

    function revokeVerifierRole(address _verifier) external onlyRole(ADMIN_ROLE) {
        _revokeRole(VERIFIER_ROLE, _verifier);
    }
}
