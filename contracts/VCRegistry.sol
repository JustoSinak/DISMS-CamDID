// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VCRegistry {
    // Mapping from VC hash to its status
    mapping(bytes32 => bool) private vcStatus;
    
    // Mapping from VC hash to its issuer
    mapping(bytes32 => address) private vcIssuers;
    
    // Events
    event VCRegistered(bytes32 vcHash, address issuer);
    event VCRevoked(bytes32 vcHash);
    
    // Register a new VC
    function registerVC(bytes32 vcHash) public {
        require(!vcStatus[vcHash], "VC already registered");
        
        vcStatus[vcHash] = true;
        vcIssuers[vcHash] = msg.sender;
        
        emit VCRegistered(vcHash, msg.sender);
    }
    
    // Revoke a VC
    function revokeVC(bytes32 vcHash) public {
        require(vcIssuers[vcHash] == msg.sender, "Not authorized");
        require(vcStatus[vcHash], "VC not found or already revoked");
        
        vcStatus[vcHash] = false;
        
        emit VCRevoked(vcHash);
    }
    
    // Check if VC is valid
    function isValidVC(bytes32 vcHash) public view returns (bool) {
        return vcStatus[vcHash];
    }
    
    // Get VC issuer
    function getIssuer(bytes32 vcHash) public view returns (address) {
        require(vcStatus[vcHash], "VC not found or revoked");
        return vcIssuers[vcHash];
    }
} 