// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

contract DIDRegistry {
    struct DIDDocument {
        string did;
        address owner;
        uint256 registeredAt;
    }

    mapping(string => DIDDocument) private didDocuments;

    event DIDRegistered(string indexed did, address indexed owner, uint256 timestamp);

    function registerDID(string memory _did) public {
        require(bytes(didDocuments[_did].did).length == 0, "DID already registered");

        didDocuments[_did] = DIDDocument({
            did: _did,
            owner: msg.sender,
            registeredAt: block.timestamp
        });

        emit DIDRegistered(_did, msg.sender, block.timestamp);
    }

    function resolveDID(string memory _did) public view returns (string memory, address, uint256) {
        DIDDocument memory doc = didDocuments[_did];
        require(bytes(doc.did).length > 0, "DID not found");
        return (doc.did, doc.owner, doc.registeredAt);
    }
}
