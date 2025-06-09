// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DIDRegistry {
    // Mapping from DID to its document hash
    mapping(string => bytes32) private didDocuments;
    
    // Mapping from DID to its controller address
    mapping(string => address) private didControllers;
    
    // Events
    event DIDRegistered(string did, bytes32 documentHash, address controller);
    event DIDUpdated(string did, bytes32 newDocumentHash);
    event DIDDeactivated(string did);
    
    // Register a new DID
    function registerDID(string memory did, bytes32 documentHash) public {
        require(didControllers[did] == address(0), "DID already registered");
        
        didDocuments[did] = documentHash;
        didControllers[did] = msg.sender;
        
        emit DIDRegistered(did, documentHash, msg.sender);
    }
    
    // Update DID document
    function updateDID(string memory did, bytes32 newDocumentHash) public {
        require(didControllers[did] == msg.sender, "Not authorized");
        
        didDocuments[did] = newDocumentHash;
        
        emit DIDUpdated(did, newDocumentHash);
    }
    
    // Deactivate DID
    function deactivateDID(string memory did) public {
        require(didControllers[did] == msg.sender, "Not authorized");
        
        delete didDocuments[did];
        delete didControllers[did];
        
        emit DIDDeactivated(did);
    }
    
    // Check if DID exists
    function didExists(string memory did) public view returns (bool) {
        return didControllers[did] != address(0);
    }
    
    // Get DID document hash
    function getDocumentHash(string memory did) public view returns (bytes32) {
        require(didExists(did), "DID not found");
        return didDocuments[did];
    }
    
    // Get DID controller
    function getController(string memory did) public view returns (address) {
        require(didExists(did), "DID not found");
        return didControllers[did];
    }
} 