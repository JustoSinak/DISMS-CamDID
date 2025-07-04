// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./libraries/CredentialTypes.sol";
import "./CredentialVerifier.sol";

// VerificationManager.sol - Verification management contract based on PRD
contract VerificationManager {
    using CredentialTypes for CredentialTypes.CredentialType;

    address public admin;
    mapping(address => bool) public authorizedVerifiers;

    CredentialVerifier public credentialVerifier;

    struct VerificationPolicy {
        uint256 minimumVerifications; // Minimum number of verifications required
        uint256 maxAge; // Maximum age of credential in days
        bool requiresBiometric; // Requires biometric verification
        uint256 verificationThreshold; // Minimum confidence score for verification
        bool requiresRenewalCheck; // Requires checking if credential needs renewal
        mapping(address => bool) authorizedVerifiers; // Authorized verifiers for this policy
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyVerifier(bytes32 _requestId) {
        require(verificationRequests[_requestId].verifier == msg.sender, "Not the verifier");
        _;
    }

    modifier onlyHolder(bytes32 _requestId) {
        require(verificationRequests[_requestId].holder == msg.sender, "Not the holder");
        _;
    }

    modifier validCredential(bytes32 _credentialHash) {
        require(credentialVerifier.credentials(_credentialHash).active, "Credential not active");
        require(!credentialVerifier.credentials(_credentialHash).revoked, "Credential revoked");
        require(block.timestamp <= credentialVerifier.credentials(_credentialHash).expiresAt, "Credential expired");
        _;
    }

    constructor(CredentialVerifier _credentialVerifier) {
        admin = msg.sender;
        credentialVerifier = _credentialVerifier;
    }

    // Admin functions
    function setAdmin(address _newAdmin) external onlyAdmin {
        admin = _newAdmin;
    }

    function authorizeVerifier(address _verifier, bool _authorized) external onlyAdmin {
        authorizedVerifiers[_verifier] = _authorized;
    }

    struct VerificationRequest {
        address verifier;
        address holder;
        bytes32[] requestedCredentials;
        uint256 timestamp;
        bool approved;
        bool completed;
        bytes[] proofs; // Zero-knowledge proofs
        mapping(bytes32 => uint256) verificationScores; // Credential hash -> score
    }

    struct VerificationHistory {
        address verifier;
        bytes32 credentialHash;
        uint256 timestamp;
        uint256 score;
        bool success;
        string reason;
    }

    mapping(bytes32 => VerificationRequest) public verificationRequests;
    mapping(address => bytes32[]) public userVerifications;
    mapping(CredentialTypes.CredentialType => VerificationPolicy) public verificationPolicies;
    mapping(address => mapping(bytes32 => VerificationHistory[])) public verificationHistory;
    mapping(address => mapping(bytes32 => uint256)) public verificationCounts; // holder -> credential -> count
    mapping(address => mapping(bytes32 => uint256)) public lastVerificationTime; // holder -> credential -> timestamp
    mapping(address => mapping(bytes32 => uint256)) public verificationScores; // holder -> credential -> score

    // Policy management
    event PolicyUpdated(CredentialTypes.CredentialType indexed credentialType, VerificationPolicy policy);
    event PolicyRemoved(CredentialTypes.CredentialType indexed credentialType);
    event PolicyAdded(CredentialTypes.CredentialType indexed credentialType, VerificationPolicy policy);
    
    // Verification events
    event VerificationRequested(bytes32 indexed requestId, address indexed verifier, address indexed holder);
    event VerificationApproved(bytes32 indexed requestId);
    event VerificationCompleted(bytes32 indexed requestId);
    event VerificationFailed(bytes32 indexed requestId, string reason);
    event VerificationScoreUpdated(bytes32 indexed credentialHash, uint256 score); // Holder's verification requests

    // Events
    event VerificationRequested(bytes32 indexed requestId, address indexed verifier, address indexed holder);
    event VerificationApproved(bytes32 indexed requestId);
    event VerificationCompleted(bytes32 indexed requestId);

    // Policy management functions
    function setVerificationPolicy(
        CredentialTypes.CredentialType _credentialType,
        VerificationPolicy memory _policy
    ) 
        external 
        onlyAdmin()
    {
        verificationPolicies[_credentialType] = _policy;
        emit PolicyUpdated(_credentialType, _policy);
    }

    function removeVerificationPolicy(CredentialTypes.CredentialType _credentialType)
        external
        onlyAdmin()
    {
        delete verificationPolicies[_credentialType];
        emit PolicyRemoved(_credentialType);
    }

    // Request verification with specific requirements
    function requestVerification(
        address _holder,
        bytes32[] memory _credentials,
        bytes[] memory _proofs
    ) 
        external 
        returns (bytes32)
    {
        require(_holder != address(0), "Invalid holder address");
        require(_credentials.length > 0, "No credentials provided");
        
        bytes32 requestId = keccak256(abi.encodePacked(
            msg.sender,
            _holder,
            _credentials,
            block.timestamp
        ));

        verificationRequests[requestId] = VerificationRequest({
            verifier: msg.sender,
            holder: _holder,
            requestedCredentials: _credentials,
            timestamp: block.timestamp,
            approved: false,
            completed: false,
            proofs: _proofs
        });

        userVerifications[_holder].push(requestId);

        emit VerificationRequested(requestId, msg.sender, _holder);
        return requestId;
    }

    // Approve verification request with verification score
    function approveVerification(
        bytes32 _requestId,
        bytes32 _credentialHash,
        uint256 _score
    ) 
        external 
        onlyHolder(_requestId)
    {
        VerificationRequest storage request = verificationRequests[_requestId];
        require(!request.approved, "Request already approved");
        require(!request.completed, "Request already completed");

        // Get credential type
        CredentialTypes.CredentialType credentialType = credentialVerifier.credentials(_credentialHash).credentialType;
        VerificationPolicy storage policy = verificationPolicies[credentialType];

        // Check verification requirements
        require(_score >= policy.verificationThreshold, "Insufficient verification score");
        require(block.timestamp - lastVerificationTime[request.holder][_credentialHash] >= policy.maxAge, "Credential too old");
        
        // Update verification history
        verificationHistory[request.verifier][_credentialHash].push(VerificationHistory({
            verifier: request.verifier,
            credentialHash: _credentialHash,
            timestamp: block.timestamp,
            score: _score,
            success: true,
            reason: "Verification approved"
        }));

        // Update verification counts and scores
        verificationCounts[request.holder][_credentialHash]++;
        lastVerificationTime[request.holder][_credentialHash] = block.timestamp;
        verificationScores[request.holder][_credentialHash] = _score;

        // Update request status
        request.approved = true;
        request.verificationScores[_credentialHash] = _score;

        emit VerificationApproved(_requestId);
        emit VerificationScoreUpdated(_credentialHash, _score);
    }

    // Complete verification process
    function completeVerification(
        bytes32 _requestId,
        bytes32 _credentialHash,
        bool _success,
        string memory _reason
    ) 
        external 
        onlyVerifier(_requestId)
    {
        VerificationRequest storage request = verificationRequests[_requestId];
        require(request.approved, "Request not approved");
        require(!request.completed, "Request already completed");

        request.completed = true;
        
        // Update verification history
        verificationHistory[request.verifier][_credentialHash].push(VerificationHistory({
            verifier: request.verifier,
            credentialHash: _credentialHash,
            timestamp: block.timestamp,
            score: request.verificationScores[_credentialHash],
            success: _success,
            reason: _reason
        }));

        emit VerificationCompleted(_requestId);
        if (!_success) {
            emit VerificationFailed(_requestId, _reason);
        }
    }

    // Complete verification (by verifier, potentially with proof)
    function completeVerification(bytes32 _requestId, bytes memory /*_proof*/) external {
        require(verificationRequests[_requestId].verifier == msg.sender, "Only verifier can complete");
        require(verificationRequests[_requestId].approved, "Request not approved yet");
        require(!verificationRequests[_requestId].completed, "Request already completed");

        // In a real scenario, _proof would be verified here
        // For this PRD implementation, we just mark as completed

        verificationRequests[_requestId].completed = true;

        emit VerificationCompleted(_requestId);
    }
}
