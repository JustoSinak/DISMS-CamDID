// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract AuditTrail {
    struct AuditEntry {
        uint256 blockNumber;
        address admin;
        bytes32 action;
        bytes32 target;
        uint256 timestamp;
    }

    AuditEntry[] public auditLog;
    mapping(address => uint256[]) public adminActions;

    event AdminActionLogged(address indexed admin, bytes32 action, bytes32 target, uint256 timestamp);

    function logAdminAction(address admin, bytes32 action, bytes32 target) external {
        AuditEntry memory entry = AuditEntry({
            blockNumber: block.number,
            admin: admin,
            action: action,
            target: target,
            timestamp: block.timestamp
        });
        auditLog.push(entry);
        adminActions[admin].push(auditLog.length - 1);
        emit AdminActionLogged(admin, action, target, block.timestamp);
    }

    function getAuditLog(uint256 fromBlock, uint256 toBlock) external view returns (AuditEntry[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < auditLog.length; i++) {
            if (auditLog[i].blockNumber >= fromBlock && auditLog[i].blockNumber <= toBlock) {
                count++;
            }
        }
        AuditEntry[] memory entries = new AuditEntry[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < auditLog.length; i++) {
            if (auditLog[i].blockNumber >= fromBlock && auditLog[i].blockNumber <= toBlock) {
                entries[idx++] = auditLog[i];
            }
        }
        return entries;
    }

    function getAdminActions(address admin) external view returns (AuditEntry[] memory) {
        uint256[] storage indices = adminActions[admin];
        AuditEntry[] memory entries = new AuditEntry[](indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            entries[i] = auditLog[indices[i]];
        }
        return entries;
    }
} 