// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// IdentityRegistry.sol - Main identity management contract based on PRD
contract IdentityRegistry {
    struct Identity {
        address owner;
        bytes32 identityHash;
        uint256 createdAt;
        uint256 updatedAt;
        bool active;
        mapping(bytes32 => bool) attributeHashes; // Mapping of attribute hash to existence
    }

    mapping(address => Identity) public identities;
    mapping(bytes32 => address) public identityHashToOwner;

    // Events
    event IdentityCreated(address indexed owner, bytes32 indexed identityHash);
    event IdentityUpdated(address indexed owner, bytes32 newHash);
    event IdentityDeactivated(address indexed owner);

    // Create a new identity
    function createIdentity(bytes32 _identityHash) external {
        require(identities[msg.sender].owner == address(0), "Identity already exists");
        require(identityHashToOwner[_identityHash] == address(0), "Identity hash already used");

        identities[msg.sender] = Identity({
            owner: msg.sender,
            identityHash: _identityHash,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            active: true
        });

        identityHashToOwner[_identityHash] = msg.sender;

        emit IdentityCreated(msg.sender, _identityHash);
    }

    // Update identity hash
    function updateIdentity(bytes32 _newIdentityHash) external {
        require(identities[msg.sender].owner == msg.sender, "Not identity owner");
        require(identities[msg.sender].active, "Identity is deactivated");
        require(identityHashToOwner[_newIdentityHash] == address(0), "New identity hash already used");

        bytes32 oldIdentityHash = identities[msg.sender].identityHash;
        
        // Update the identity struct
        identities[msg.sender].identityHash = _newIdentityHash;
        identities[msg.sender].updatedAt = block.timestamp;

        // Update the hash-to-owner mapping
        delete identityHashToOwner[oldIdentityHash];
        identityHashToOwner[_newIdentityHash] = msg.sender;

        emit IdentityUpdated(msg.sender, _newIdentityHash);
    }

    // Deactivate identity
    function deactivateIdentity() external {
        require(identities[msg.sender].owner == msg.sender, "Not identity owner");
        require(identities[msg.sender].active, "Identity already deactivated");

        identities[msg.sender].active = false;
        identities[msg.sender].updatedAt = block.timestamp;

        // Optionally, you might want to clear the identityHashToOwner mapping here
        // delete identityHashToOwner[identities[msg.sender].identityHash];

        emit IdentityDeactivated(msg.sender);
    }

    // Verify if an address has an active identity
    function verifyIdentity(address _owner) external view returns (bool) {
        return identities[_owner].active;
    }
}
