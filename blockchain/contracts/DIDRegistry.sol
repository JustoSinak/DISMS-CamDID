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

    // Mapping from DID to array of DID Document versions
    mapping(string => DIDDocument[]) private didDocumentVersions;
    // Mapping from DID to current version index
    mapping(string => uint256) private currentVersionIndex;
    
    // Events
    event DIDCreated(string indexed did, address indexed owner, uint256 timestamp);
    event DIDUpdated(string indexed did, address indexed owner, uint256 timestamp, uint256 version);
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
        require(didDocumentVersions[did].length == 0, "DID already exists");

        DIDDocument memory newDoc = DIDDocument({
            owner: msg.sender,
            publicKey: publicKey,
            authenticationKey: authenticationKey,
            serviceEndpoint: serviceEndpoint,
            created: block.timestamp,
            updated: block.timestamp,
            active: true
        });
        didDocumentVersions[did].push(newDoc);
        currentVersionIndex[did] = 0;

        emit DIDCreated(did, msg.sender, block.timestamp);
        return true;
    }

    // Update DID Document (pushes new version)
    function updateDID(
        string memory did,
        string memory publicKey,
        string memory authenticationKey,
        string memory serviceEndpoint
    ) external whenNotPaused returns (bool) {
        require(bytes(did).length > 0, "DID cannot be empty");
        require(didDocumentVersions[did].length > 0, "DID does not exist");
        DIDDocument storage currentDoc = didDocumentVersions[did][currentVersionIndex[did]];
        require(currentDoc.owner == msg.sender, "Not authorized");
        require(currentDoc.active, "DID is deactivated");

        DIDDocument memory newDoc = DIDDocument({
            owner: currentDoc.owner,
            publicKey: publicKey,
            authenticationKey: authenticationKey,
            serviceEndpoint: serviceEndpoint,
            created: currentDoc.created,
            updated: block.timestamp,
            active: true
        });
        didDocumentVersions[did].push(newDoc);
        currentVersionIndex[did] = didDocumentVersions[did].length - 1;

        emit DIDUpdated(did, msg.sender, block.timestamp, currentVersionIndex[did]);
        return true;
    }

    // Deactivate DID (pushes new version with active=false)
    function deactivateDID(string memory did) external whenNotPaused returns (bool) {
        require(bytes(did).length > 0, "DID cannot be empty");
        require(didDocumentVersions[did].length > 0, "DID does not exist");
        DIDDocument storage currentDoc = didDocumentVersions[did][currentVersionIndex[did]];
        require(currentDoc.owner == msg.sender, "Not authorized");
        require(currentDoc.active, "DID already deactivated");

        DIDDocument memory newDoc = DIDDocument({
            owner: currentDoc.owner,
            publicKey: currentDoc.publicKey,
            authenticationKey: currentDoc.authenticationKey,
            serviceEndpoint: currentDoc.serviceEndpoint,
            created: currentDoc.created,
            updated: block.timestamp,
            active: false
        });
        didDocumentVersions[did].push(newDoc);
        currentVersionIndex[did] = didDocumentVersions[did].length - 1;

        emit DIDDeactivated(did, block.timestamp);
        return true;
    }

    // Read current DID Document
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
        require(didDocumentVersions[did].length > 0, "DID does not exist");
        DIDDocument storage document = didDocumentVersions[did][currentVersionIndex[did]];
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

    // Get DID Document version count
    function getDIDVersionCount(string memory did) external view returns (uint256) {
        return didDocumentVersions[did].length;
    }

    // Get a specific version of a DID Document
    function getDIDVersion(string memory did, uint256 version) external view returns (
        address owner,
        string memory publicKey,
        string memory authenticationKey,
        string memory serviceEndpoint,
        uint256 created,
        uint256 updated,
        bool active
    ) {
        require(bytes(did).length > 0, "DID cannot be empty");
        require(didDocumentVersions[did].length > 0, "DID does not exist");
        require(version < didDocumentVersions[did].length, "Invalid version");
        DIDDocument storage document = didDocumentVersions[did][version];
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
