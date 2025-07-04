// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

contract CredentialSharing is EIP712 {
    using Strings for uint256;
    using ECDSA for bytes32;

    struct ShareRequest {
        bytes32 credentialHash;
        address sharer;
        address recipient;
        uint256 expirationTime;
        bytes32[] revealedAttributes;
        bytes signature;
        bool used;
    }

    struct ShareHistory {
        bytes32 credentialHash;
        address sharer;
        address recipient;
        uint256 timestamp;
        bool revealed;
        bytes32[] revealedAttributes;
    }

    mapping(bytes32 => ShareRequest) public shareRequests;
    mapping(address => mapping(bytes32 => ShareHistory[])) public sharingHistory;
    mapping(address => mapping(bytes32 => bool)) public sharedCredentials;
    mapping(bytes32 => uint256) public shareCounts;

    event CredentialShared(
        bytes32 indexed credentialHash,
        address indexed sharer,
        address indexed recipient,
        uint256 expirationTime,
        bytes32[] revealedAttributes
    );

    event ShareUsed(
        bytes32 indexed shareId,
        address indexed recipient,
        uint256 timestamp
    );

    event ShareExpired(
        bytes32 indexed shareId,
        address indexed sharer
    );

    bytes32 private constant SHARE_TYPEHASH = keccak256(
        "ShareRequest(bytes32 credentialHash,address sharer,address recipient,uint256 expirationTime,bytes32[] revealedAttributes)"
    );

    constructor() EIP712("DISMS Credential Sharing", "1.0") {}

    // Generate a QR code for sharing credentials
    function generateShareQR(
        bytes32 _credentialHash,
        address _recipient,
        uint256 _expirationTime,
        bytes32[] memory _revealedAttributes
    ) 
        external 
        returns (string memory)
    {
        require(_expirationTime > block.timestamp, "Invalid expiration time");
        require(_revealedAttributes.length > 0, "No attributes selected");

        bytes32 shareId = keccak256(abi.encodePacked(
            _credentialHash,
            msg.sender,
            _recipient,
            _expirationTime,
            _revealedAttributes
        ));

        shareRequests[shareId] = ShareRequest(
            _credentialHash,
            msg.sender,
            _recipient,
            _expirationTime,
            _revealedAttributes,
            bytes(""), // Signature will be added later
            false
        );

        shareCounts[shareId] = 0;
        sharedCredentials[msg.sender][_credentialHash] = true;

        string memory qrData = string(abi.encodePacked(
            "DISMS:credential://",
            _credentialHash.toString(),
            "?sharer=",
            Strings.toHexString(uint160(msg.sender), 20),
            "&recipient=",
            Strings.toHexString(uint160(_recipient), 20),
            "&expiration=",
            _expirationTime.toString(),
            "&shareId=",
            Strings.toHexString(uint256(shareId), 32)
        ));

        emit CredentialShared(
            _credentialHash,
            msg.sender,
            _recipient,
            _expirationTime,
            _revealedAttributes
        );

        return qrData;
    }

    // Generate a time-limited sharing link
    function generateShareLink(
        bytes32 _credentialHash,
        address _recipient,
        uint256 _expirationTime,
        bytes32[] memory _revealedAttributes
    ) 
        external 
        returns (string memory)
    {
        require(_expirationTime > block.timestamp, "Invalid expiration time");
        require(_revealedAttributes.length > 0, "No attributes selected");

        bytes32 shareId = keccak256(abi.encodePacked(
            _credentialHash,
            msg.sender,
            _recipient,
            _expirationTime,
            _revealedAttributes
        ));

        shareRequests[shareId] = ShareRequest(
            _credentialHash,
            msg.sender,
            _recipient,
            _expirationTime,
            _revealedAttributes,
            bytes(""), // Signature will be added later
            false
        );

        shareCounts[shareId] = 0;
        sharedCredentials[msg.sender][_credentialHash] = true;

        string memory link = string(abi.encodePacked(
            "https://dism.id/share?",
            "credentialHash=",
            _credentialHash.toString(),
            "&sharer=",
            Strings.toHexString(uint160(msg.sender), 20),
            "&recipient=",
            Strings.toHexString(uint160(_recipient), 20),
            "&expiration=",
            _expirationTime.toString(),
            "&shareId=",
            Strings.toHexString(uint256(shareId), 32)
        ));

        emit CredentialShared(
            _credentialHash,
            msg.sender,
            _recipient,
            _expirationTime,
            _revealedAttributes
        );

        return link;
    }

    // Verify and use a shared credential
    function useSharedCredential(
        bytes32 _shareId,
        bytes memory _signature
    ) 
        external 
        returns (bool)
    {
        ShareRequest storage request = shareRequests[_shareId];
        require(!request.used, "Share already used");
        require(block.timestamp <= request.expirationTime, "Share expired");
        require(msg.sender == request.recipient, "Not authorized recipient");

        // Verify signature
        bytes32 structHash = keccak256(
            abi.encode(
                SHARE_TYPEHASH,
                request.credentialHash,
                request.sharer,
                request.recipient,
                request.expirationTime,
                keccak256(abi.encodePacked(request.revealedAttributes))
            )
        );

        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = hash.recover(_signature);
        require(signer == request.sharer, "Invalid signature");

        // Update share status
        request.used = true;
        request.signature = _signature;

        // Record sharing history
        sharingHistory[request.sharer][request.credentialHash].push(
            ShareHistory({
                credentialHash: request.credentialHash,
                sharer: request.sharer,
                recipient: request.recipient,
                timestamp: block.timestamp,
                revealed: true,
                revealedAttributes: request.revealedAttributes
            })
        );

        shareCounts[_shareId]++;

        emit ShareUsed(_shareId, msg.sender, block.timestamp);

        return true;
    }

    // Get sharing history for a credential
    function getSharingHistory(
        address _user,
        bytes32 _credentialHash
    ) 
        external 
        view 
        returns (ShareHistory[] memory)
    {
        return sharingHistory[_user][_credentialHash];
    }

    // Check if a credential has been shared
    function hasSharedCredential(
        address _user,
        bytes32 _credentialHash
    ) 
        external 
        view 
        returns (bool)
    {
        return sharedCredentials[_user][_credentialHash];
    }

    // Get share count for a specific share
    function getShareCount(bytes32 _shareId) 
        external 
        view 
        returns (uint256)
    {
        return shareCounts[_shareId];
    }
}
