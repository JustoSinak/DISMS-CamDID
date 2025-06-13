// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// IdentityRegistry.sol - Main identity management contract
contract IdentityRegistry {
    struct Identity {
        address owner;
        bytes32 identityHash;
        string metadataURI; // IPFS hash for additional data
        bool active;
        uint256 createdAt;
        uint256 updatedAt;
        bytes32[] credentialHashes;
    }
    
    struct IdentityAttribute {
        string attributeType; // e.g., "name", "email", "phone"
        bytes32 attributeHash; // Hash of the actual value
        bool verified;
        address verifier;
        uint256 verifiedAt;
    }
    
    mapping(address => Identity) public identities;
    mapping(bytes32 => address) public identityHashToAddress;
    mapping(address => mapping(string => IdentityAttribute)) public identityAttributes;
    mapping(address => string[]) public userAttributeTypes;
    
    event IdentityCreated(
        address indexed owner,
        bytes32 indexed identityHash,
        string metadataURI
    );
    
    event IdentityUpdated(
        address indexed owner,
        bytes32 indexed identityHash,
        string metadataURI
    );
    
    event AttributeAdded(
        address indexed owner,
        string attributeType,
        bytes32 attributeHash
    );
    
    event AttributeVerified(
        address indexed owner,
        string attributeType,
        address indexed verifier
    );
    
    modifier onlyIdentityOwner() {
        require(identities[msg.sender].owner == msg.sender, "Not identity owner");
        _;
    }
    
    modifier identityExists(address _owner) {
        require(identities[_owner].active, "Identity does not exist");
        _;
    }
    
    // Create a new identity
    function createIdentity(
        bytes32 _identityHash,
        string memory _metadataURI
    ) public {
        require(identities[msg.sender].owner == address(0), "Identity already exists");
        require(identityHashToAddress[_identityHash] == address(0), "Identity hash already used");
        
        identities[msg.sender] = Identity({
            owner: msg.sender,
            identityHash: _identityHash,
            metadataURI: _metadataURI,
            active: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            credentialHashes: new bytes32[](0)
        });
        
        identityHashToAddress[_identityHash] = msg.sender;
        
        emit IdentityCreated(msg.sender, _identityHash, _metadataURI);
    }
    
    // Add identity attribute
    function addAttribute(
        string memory _attributeType,
        bytes32 _attributeHash
    ) public onlyIdentityOwner {
        require(bytes(_attributeType).length > 0, "Attribute type cannot be empty");
        
        // If this is a new attribute type for this user, add it to the list
        if (identityAttributes[msg.sender][_attributeType].attributeHash == bytes32(0)) {
            userAttributeTypes[msg.sender].push(_attributeType);
        }
        
        identityAttributes[msg.sender][_attributeType] = IdentityAttribute({
            attributeType: _attributeType,
            attributeHash: _attributeHash,
            verified: false,
            verifier: address(0),
            verifiedAt: 0
        });
        
        identities[msg.sender].updatedAt = block.timestamp;
        
        emit AttributeAdded(msg.sender, _attributeType, _attributeHash);
    }
    
    // Get user's attribute types
    function getUserAttributeTypes(address _user) public view returns (string[] memory) {
        return userAttributeTypes[_user];
    }
    
    // Verify an attribute (can be called by authorized verifiers)
    function verifyAttribute(
        address _owner,
        string memory _attributeType
    ) public identityExists(_owner) {
        require(
            identityAttributes[_owner][_attributeType].attributeHash != bytes32(0),
            "Attribute does not exist"
        );
        
        identityAttributes[_owner][_attributeType].verified = true;
        identityAttributes[_owner][_attributeType].verifier = msg.sender;
        identityAttributes[_owner][_attributeType].verifiedAt = block.timestamp;
        
        emit AttributeVerified(_owner, _attributeType, msg.sender);
    }
    
    // Get identity information
    function getIdentity(address _owner) public view returns (
        bytes32 identityHash,
        string memory metadataURI,
        bool active,
        uint256 createdAt,
        uint256 updatedAt
    ) {
        Identity memory identity = identities[_owner];
        return (
            identity.identityHash,
            identity.metadataURI,
            identity.active,
            identity.createdAt,
            identity.updatedAt
        );
    }
}