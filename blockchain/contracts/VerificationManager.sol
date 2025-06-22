// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

// VerificationManager.sol - Verification management contract based on PRD
contract VerificationManager {
    struct VerificationRequest {
        address verifier;
        address holder;
        bytes32[] requestedCredentials;
        uint256 timestamp;
        bool approved;
        bool completed;
    }

    mapping(bytes32 => VerificationRequest) public verificationRequests;
    mapping(address => bytes32[]) public userVerifications; // Holder's verification requests

    // Events
    event VerificationRequested(bytes32 indexed requestId, address indexed verifier, address indexed holder);
    event VerificationApproved(bytes32 indexed requestId);
    event VerificationCompleted(bytes32 indexed requestId);

    // Request verification
    function requestVerification(address _holder, bytes32[] memory _credentials) external returns (bytes32) {
        bytes32 requestId = keccak256(abi.encodePacked(msg.sender, _holder, _credentials, block.timestamp));

        verificationRequests[requestId] = VerificationRequest({
            verifier: msg.sender,
            holder: _holder,
            requestedCredentials: _credentials,
            timestamp: block.timestamp,
            approved: false,
            completed: false
        });

        userVerifications[_holder].push(requestId);

        emit VerificationRequested(requestId, msg.sender, _holder);
        return requestId;
    }

    // Approve verification request (by holder)
    function approveVerification(bytes32 _requestId) external {
        require(verificationRequests[_requestId].holder == msg.sender, "Only holder can approve");
        require(!verificationRequests[_requestId].approved, "Request already approved");

        verificationRequests[_requestId].approved = true;

        emit VerificationApproved(_requestId);
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
