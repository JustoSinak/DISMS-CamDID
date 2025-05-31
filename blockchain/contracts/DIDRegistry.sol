// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract DIDRegistry is Ownable, Pausable {
    struct DIDDocument {
        address owner;
        string publicKey;
        string authenticationKey;
        string serviceEndpoint;
        uint256 created;
        uint256 updated;
        bool active;
    }

    // Mapping from DID to DID Document
    mapping(string => DIDDocument) private didDocuments;
    
    // Events
    event DIDCreated(string indexed did, address indexed owner, uint256 timestamp);
    event DIDUpdated(string indexed did, address indexed owner, uint256 timestamp);
    event DIDDeactivated(string indexed did, uint256 timestamp);

    constructor() {}

    // Create a new DID
    function createDID(
        string memory did,
        string memory publicKey,
        string memory authenticationKey,
        string memory serviceEndpoint
    ) external whenNotPaused returns (bool) {
        require(bytes(did).length > 0, "DID cannot be empty");
        require(didDocuments[did].created == 0, "DID already exists");

        didDocuments[did] = DIDDocument({
            owner: msg.sender,
            publicKey: publicKey,
            authenticationKey: authenticationKey,
            serviceEndpoint: serviceEndpoint,
            created: block.timestamp,
            updated: block.timestamp,
            active: true
        });

        emit DIDCreated(did, msg.sender, block.timestamp);
        return true;
    }

    // Update DID Document
    function updateDID(
        string memory did,
        string memory publicKey,
        string memory authenticationKey,
        string memory serviceEndpoint
    ) external whenNotPaused returns (bool) {
        require(bytes(did).length > 0, "DID cannot be empty");
        require(didDocuments[did].created != 0, "DID does not exist");
        require(didDocuments[did].owner == msg.sender, "Not authorized");
        require(didDocuments[did].active, "DID is deactivated");

        DIDDocument storage document = didDocuments[did];
        document.publicKey = publicKey;
        document.authenticationKey = authenticationKey;
        document.serviceEndpoint = serviceEndpoint;
        document.updated = block.timestamp;

        emit DIDUpdated(did, msg.sender, block.timestamp);
        return true;
    }

    // Deactivate DID
    function deactivateDID(string memory did) external whenNotPaused returns (bool) {
        require(bytes(did).length > 0, "DID cannot be empty");
        require(didDocuments[did].created != 0, "DID does not exist");
        require(didDocuments[did].owner == msg.sender, "Not authorized");
        require(didDocuments[did].active, "DID already deactivated");

        didDocuments[did].active = false;
        emit DIDDeactivated(did, block.timestamp);
        return true;
    }

    // Read DID Document
    function resolveDID(string memory did) external view returns (
        address owner,
        string memory publicKey,
        string memory authenticationKey,
        string memory serviceEndpoint,
        uint256 created,
        uint256 updated,
        bool active
    ) {
        require(bytes(did).length > 0, "DID cannot be empty");
        require(didDocuments[did].created != 0, "DID does not exist");

        DIDDocument storage document = didDocuments[did];
        return (
            document.owner,
            document.publicKey,
            document.authenticationKey,
            document.serviceEndpoint,
            document.created,
            document.updated,
            document.active
        );
    }

    // Emergency pause
    function pause() external onlyOwner {
        _pause();
    }

    // Unpause
    function unpause() external onlyOwner {
        _unpause();
    }
}
