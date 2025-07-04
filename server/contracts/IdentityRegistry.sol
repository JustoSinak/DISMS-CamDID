pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./AccessControl.sol";

contract IdentityRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ISSUER_ROLE, msg.sender);
        _setupRole(VERIFIER_ROLE, msg.sender);
    }
    struct Identity {
        bytes32 did;
        bool exists;
        bool revoked;
        uint256 createdAt;
        uint256 updatedAt;
        mapping(bytes32 => Credential) credentials;
    }

    struct Credential {
        bytes32 credentialId;
        bytes32 issuer;
        bytes32 subject;
        bool revoked;
        uint256 issuedAt;
        uint256 revokedAt;
    }

    mapping(bytes32 => Identity) private identities;
    mapping(bytes32 => bool) private dids;

    event IdentityCreated(bytes32 indexed did, address indexed owner, uint256 timestamp);
    event IdentityRevoked(bytes32 indexed did, uint256 timestamp);
    event CredentialIssued(bytes32 indexed did, bytes32 indexed credentialId, bytes32 indexed issuer, uint256 timestamp);
    event CredentialRevoked(bytes32 indexed did, bytes32 indexed credentialId, uint256 timestamp);

    modifier onlyIdentityOwner(bytes32 _did) {
        require(dids[_did], "Identity does not exist");
        require(msg.sender == owner(), "Only identity owner can perform this action");
        _;
    }

    function createIdentity(bytes32 _did) external onlyOwner nonReentrant {
        require(!_didExists(_did), "DID already exists");
        
        identities[_did] = Identity({
            did: _did,
            exists: true,
            revoked: false,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        dids[_did] = true;

        emit IdentityCreated(_did, msg.sender, block.timestamp);
    }

    function revokeIdentity(bytes32 _did) external onlyOwner nonReentrant {
        require(_didExists(_did), "Identity does not exist");
        require(!identities[_did].revoked, "Identity already revoked");

        identities[_did].revoked = true;
        identities[_did].updatedAt = block.timestamp;

        emit IdentityRevoked(_did, block.timestamp);
    }

    function issueCredential(
        bytes32 _did,
        bytes32 _credentialId,
        bytes32 _issuer,
        bytes32 _subject
    ) external onlyIssuer nonReentrant {
        require(_didExists(_did), "Identity does not exist");
        require(!identities[_did].revoked, "Identity is revoked");
        require(identities[_did].credentials[_credentialId].credentialId == bytes32(0), "Credential already exists");
        require(msg.sender == _issuer, "Issuer must be the one issuing the credential");

        identities[_did].credentials[_credentialId] = Credential({
            credentialId: _credentialId,
            issuer: _issuer,
            subject: _subject,
            revoked: false,
            issuedAt: block.timestamp,
            revokedAt: 0
        });

        emit CredentialIssued(_did, _credentialId, _issuer, block.timestamp);
    }

    function revokeCredential(
        bytes32 _did,
        bytes32 _credentialId
    ) external onlyIssuer nonReentrant {
        require(_didExists(_did), "Identity does not exist");
        require(!identities[_did].revoked, "Identity is revoked");
        require(identities[_did].credentials[_credentialId].credentialId != bytes32(0), "Credential does not exist");
        require(!identities[_did].credentials[_credentialId].revoked, "Credential already revoked");
        require(msg.sender == identities[_did].credentials[_credentialId].issuer, "Only issuer can revoke credential");

        identities[_did].credentials[_credentialId].revoked = true;
        identities[_did].credentials[_credentialId].revokedAt = block.timestamp;

        emit CredentialRevoked(_did, _credentialId, block.timestamp);
    }

    function verifyCredential(
        bytes32 _did,
        bytes32 _credentialId
    ) external onlyVerifier nonReentrant returns (bool isValid) {
        require(_didExists(_did), "Identity does not exist");
        require(!identities[_did].revoked, "Identity is revoked");
        require(identities[_did].credentials[_credentialId].credentialId != bytes32(0), "Credential does not exist");
        require(!identities[_did].credentials[_credentialId].revoked, "Credential is revoked");

        // Additional verification logic can be added here
        return true;
    }

    function getIdentity(bytes32 _did) external view returns (
        bool exists,
        bool revoked,
        uint256 createdAt,
        uint256 updatedAt
    ) {
        Identity storage identity = identities[_did];
        return (
            identity.exists,
            identity.revoked,
            identity.createdAt,
            identity.updatedAt
        );
    }

    function getCredential(
        bytes32 _did,
        bytes32 _credentialId
    ) external view returns (
        bytes32 credentialId,
        bytes32 issuer,
        bytes32 subject,
        bool revoked,
        uint256 issuedAt,
        uint256 revokedAt
    ) {
        Credential storage credential = identities[_did].credentials[_credentialId];
        return (
            credential.credentialId,
            credential.issuer,
            credential.subject,
            credential.revoked,
            credential.issuedAt,
            credential.revokedAt
        );
    }

    function _didExists(bytes32 _did) internal view returns (bool) {
        return dids[_did];
    }
}
