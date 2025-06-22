// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// CredentialManager.sol - Credential management contract based on PRD
contract CredentialManager {
    struct Credential {
        bytes32 credentialHash;
        address issuer;
        address holder;
        uint256 issuedAt;
        uint256 expiresAt;
        bool revoked;
        string credentialType;
        bytes32 schemaId; // Reference to schema
        bytes32 commitment; // Commitment hash for privacy
        bytes32 merkleRoot; // For selective disclosure
    }

    struct CredentialSchema {
        bytes32 schemaId;
        string schemaURI; // IPFS or URL to schema definition
        string schemaType;
        uint256 version;
        address registeredBy;
        uint256 registeredAt;
    }

    mapping(bytes32 => Credential) public credentials;
    mapping(address => bytes32[]) public userCredentials; // Holder's credentials
    mapping(address => bool) public authorizedIssuers;
    mapping(bytes32 => CredentialSchema) public credentialSchemas;
    bytes32[] public allSchemaIds;

    // Events
    event CredentialIssued(bytes32 indexed credentialHash, address indexed issuer, address indexed holder, bytes32 schemaId);
    event CredentialRevoked(bytes32 indexed credentialHash, address indexed revoker);
    event IssuerAuthorized(address indexed issuer);
    event SchemaRegistered(bytes32 indexed schemaId, string schemaURI, string schemaType, uint256 version, address registeredBy);

    // Authorize an issuer
    function authorizeIssuer(address _issuer) external {
        require(!authorizedIssuers[_issuer], "Issuer already authorized");
        authorizedIssuers[_issuer] = true;
        emit IssuerAuthorized(_issuer);
    }

    // Register a credential schema
    function registerSchema(string memory _schemaURI, string memory _schemaType, uint256 _version) external returns (bytes32) {
        bytes32 schemaId = keccak256(abi.encodePacked(_schemaURI, _schemaType, _version));
        require(credentialSchemas[schemaId].registeredAt == 0, "Schema already exists");
        credentialSchemas[schemaId] = CredentialSchema({
            schemaId: schemaId,
            schemaURI: _schemaURI,
            schemaType: _schemaType,
            version: _version,
            registeredBy: msg.sender,
            registeredAt: block.timestamp
        });
        allSchemaIds.push(schemaId);
        emit SchemaRegistered(schemaId, _schemaURI, _schemaType, _version, msg.sender);
        return schemaId;
    }

    // Get all schema IDs
    function getAllSchemaIds() external view returns (bytes32[] memory) {
        return allSchemaIds;
    }

    // Issue a new credential
    function issueCredential(
        address _holder,
        bytes32 _credentialHash,
        string memory _type,
        uint256 _expiresAt,
        bytes32 _schemaId,
        bytes32 _commitment,
        bytes32 _merkleRoot
    ) external {
        require(authorizedIssuers[msg.sender], "Not an authorized issuer");
        require(credentials[_credentialHash].holder == address(0), "Credential already exists"); // Check if credentialHash is already used
        require(credentialSchemas[_schemaId].registeredAt != 0, "Schema does not exist");

        credentials[_credentialHash] = Credential({
            credentialHash: _credentialHash,
            issuer: msg.sender,
            holder: _holder,
            issuedAt: block.timestamp,
            expiresAt: _expiresAt,
            revoked: false,
            credentialType: _type,
            schemaId: _schemaId,
            commitment: _commitment,
            merkleRoot: _merkleRoot
        });

        userCredentials[_holder].push(_credentialHash);

        emit CredentialIssued(_credentialHash, msg.sender, _holder, _schemaId);
    }

    // Revoke a credential
    function revokeCredential(bytes32 _credentialHash) external {
        require(credentials[_credentialHash].issuer == msg.sender, "Only issuer can revoke");
        require(!credentials[_credentialHash].revoked, "Credential already revoked");

        credentials[_credentialHash].revoked = true;

        emit CredentialRevoked(_credentialHash, msg.sender);
    }

    // Verify a credential (check existence, not revoked, and not expired)
    function verifyCredential(bytes32 _credentialHash) external view returns (bool) {
        Credential memory cred = credentials[_credentialHash];
        return (
            cred.holder != address(0) && // Check if credential exists
            !cred.revoked &&
            (cred.expiresAt == 0 || cred.expiresAt > block.timestamp) // Check expiration (0 means no expiration)
        );
    }

    // Verify a commitment
    function verifyCommitment(bytes32 _credentialHash, bytes32 _revealed) external view returns (bool) {
        return credentials[_credentialHash].commitment == keccak256(abi.encodePacked(_revealed));
    }

    // Verify a Merkle root (for selective disclosure)
    function verifyMerkleRoot(bytes32 _credentialHash, bytes32 _merkleRoot) external view returns (bool) {
        return credentials[_credentialHash].merkleRoot == _merkleRoot;
    }
}
