// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./interfaces/IAdminRegistry.sol";

contract AuditTrail {
    IAdminRegistry public adminRegistry;
    
    struct AuditEntry {
        uint256 id;
        uint256 blockNumber;
        address admin;
        bytes32 action;
        bytes32 target;
        uint256 timestamp;
        string details;
        bool isCompliance;
        uint256 gasUsed;
    }

    struct ComplianceReport {
        uint256 reportId;
        uint256 startTime;
        uint256 endTime;
        uint256 totalActions;
        uint256 complianceActions;
        uint256 violations;
        string reportHash;
        bool isFinalized;
    }

    AuditEntry[] public auditLog;
    mapping(address => uint256[]) public adminActions;
    mapping(bytes32 => uint256[]) public actionTypeLogs;
    mapping(uint256 => ComplianceReport) public complianceReports;
    
    uint256 public totalAuditEntries;
    uint256 public totalComplianceReports;
    uint256 public lastAuditEntry;
    
    // Events
    event AdminActionLogged(
        uint256 indexed entryId,
        address indexed admin, 
        bytes32 action, 
        bytes32 target, 
        uint256 timestamp,
        string details
    );
    event ComplianceReportCreated(
        uint256 indexed reportId,
        uint256 startTime,
        uint256 endTime,
        address indexed createdBy
    );
    event ComplianceReportFinalized(
        uint256 indexed reportId,
        uint256 totalActions,
        uint256 complianceActions,
        uint256 violations
    );
    event AuditEntryUpdated(
        uint256 indexed entryId,
        string newDetails,
        address indexed updatedBy
    );

    modifier onlyAdmin() {
        (uint8 role, bool active) = adminRegistry.getAdminRoleAndStatus(msg.sender);
        require(active && role > 0, "Not admin");
        _;
    }

    modifier onlyAuditAdmin() {
        require(adminRegistry.hasPermission(msg.sender, keccak256("AUDIT_ACCESS")), "No audit permission");
        _;
    }

    constructor(address _adminRegistry) {
        adminRegistry = IAdminRegistry(_adminRegistry);
    }

    function logAdminAction(
        address admin, 
        bytes32 action, 
        bytes32 target, 
        string memory details,
        bool isCompliance
    ) external onlyAdmin {
        uint256 gasStart = gasleft();
        
        AuditEntry memory entry = AuditEntry({
            id: totalAuditEntries + 1,
            blockNumber: block.number,
            admin: admin,
            action: action,
            target: target,
            timestamp: block.timestamp,
            details: details,
            isCompliance: isCompliance,
            gasUsed: gasStart - gasleft()
        });
        
        auditLog.push(entry);
        adminActions[admin].push(totalAuditEntries);
        actionTypeLogs[action].push(totalAuditEntries);
        
        totalAuditEntries++;
        lastAuditEntry = block.timestamp;
        
        emit AdminActionLogged(
            entry.id,
            admin, 
            action, 
            target, 
            block.timestamp,
            details
        );
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

    function getActionTypeLogs(bytes32 action) external view returns (AuditEntry[] memory) {
        uint256[] storage indices = actionTypeLogs[action];
        AuditEntry[] memory entries = new AuditEntry[](indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            entries[i] = auditLog[indices[i]];
        }
        return entries;
    }

    function getAuditEntry(uint256 entryId) external view returns (AuditEntry memory) {
        require(entryId > 0 && entryId <= auditLog.length, "Invalid entry ID");
        return auditLog[entryId - 1];
    }

    function getRecentAuditEntries(uint256 count) external view returns (AuditEntry[] memory) {
        uint256 actualCount = count > auditLog.length ? auditLog.length : count;
        AuditEntry[] memory entries = new AuditEntry[](actualCount);
        
        for (uint256 i = 0; i < actualCount; i++) {
            entries[i] = auditLog[auditLog.length - 1 - i];
        }
        
        return entries;
    }

    function createComplianceReport(
        uint256 startTime,
        uint256 endTime,
        string memory reportHash
    ) external onlyAuditAdmin returns (uint256) {
        require(startTime < endTime, "Invalid time range");
        require(endTime <= block.timestamp, "End time cannot be in future");
        
        uint256 reportId = totalComplianceReports + 1;
        
        complianceReports[reportId] = ComplianceReport({
            reportId: reportId,
            startTime: startTime,
            endTime: endTime,
            totalActions: 0,
            complianceActions: 0,
            violations: 0,
            reportHash: reportHash,
            isFinalized: false
        });
        
        totalComplianceReports++;
        
        emit ComplianceReportCreated(reportId, startTime, endTime, msg.sender);
        
        return reportId;
    }

    function finalizeComplianceReport(uint256 reportId) external onlyAuditAdmin {
        ComplianceReport storage report = complianceReports[reportId];
        require(report.reportId != 0, "Report not found");
        require(!report.isFinalized, "Report already finalized");
        
        // Calculate compliance metrics
        uint256 totalActions = 0;
        uint256 complianceActions = 0;
        uint256 violations = 0;
        
        for (uint256 i = 0; i < auditLog.length; i++) {
            if (auditLog[i].timestamp >= report.startTime && auditLog[i].timestamp <= report.endTime) {
                totalActions++;
                if (auditLog[i].isCompliance) {
                    complianceActions++;
                } else {
                    violations++;
                }
            }
        }
        
        report.totalActions = totalActions;
        report.complianceActions = complianceActions;
        report.violations = violations;
        report.isFinalized = true;
        
        emit ComplianceReportFinalized(reportId, totalActions, complianceActions, violations);
    }

    function getComplianceReport(uint256 reportId) external view returns (ComplianceReport memory) {
        return complianceReports[reportId];
    }

    function updateAuditEntry(
        uint256 entryId, 
        string memory newDetails
    ) external onlyAuditAdmin {
        require(entryId > 0 && entryId <= auditLog.length, "Invalid entry ID");
        
        auditLog[entryId - 1].details = newDetails;
        
        emit AuditEntryUpdated(entryId, newDetails, msg.sender);
    }

    function getAuditStatistics() external view returns (
        uint256 totalEntries,
        uint256 totalAdmins,
        uint256 totalActions,
        uint256 lastEntryTime,
        uint256 totalComplianceReportsParam
    ) {
        return (
            totalAuditEntries,
            _getUniqueAdminCount(),
            _getUniqueActionCount(),
            lastAuditEntry,
            totalComplianceReports
        );
    }

    function getComplianceMetrics(uint256 startTime, uint256 endTime) external view returns (
        uint256 totalActions,
        uint256 complianceActions,
        uint256 violations,
        uint256 complianceRate
    ) {
        uint256 total = 0;
        uint256 compliant = 0;
        uint256 violations_count = 0;
        
        for (uint256 i = 0; i < auditLog.length; i++) {
            if (auditLog[i].timestamp >= startTime && auditLog[i].timestamp <= endTime) {
                total++;
                if (auditLog[i].isCompliance) {
                    compliant++;
                } else {
                    violations_count++;
                }
            }
        }
        
        uint256 rate = total > 0 ? (compliant * 100) / total : 0;
        
        return (total, compliant, violations_count, rate);
    }

    function searchAuditLog(
        address admin,
        bytes32 action,
        uint256 startTime,
        uint256 endTime
    ) external view returns (AuditEntry[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < auditLog.length; i++) {
            if ((admin == address(0) || auditLog[i].admin == admin) &&
                (action == bytes32(0) || auditLog[i].action == action) &&
                auditLog[i].timestamp >= startTime &&
                auditLog[i].timestamp <= endTime) {
                count++;
            }
        }
        
        AuditEntry[] memory entries = new AuditEntry[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < auditLog.length; i++) {
            if ((admin == address(0) || auditLog[i].admin == admin) &&
                (action == bytes32(0) || auditLog[i].action == action) &&
                auditLog[i].timestamp >= startTime &&
                auditLog[i].timestamp <= endTime) {
                entries[idx++] = auditLog[i];
            }
        }
        
        return entries;
    }

    function _getUniqueAdminCount() internal view returns (uint256) {
        address[] memory uniqueAdmins = new address[](auditLog.length);
        uint256 uniqueCount = 0;
        
        for (uint256 i = 0; i < auditLog.length; i++) {
            bool found = false;
            for (uint256 j = 0; j < uniqueCount; j++) {
                if (uniqueAdmins[j] == auditLog[i].admin) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                uniqueAdmins[uniqueCount] = auditLog[i].admin;
                uniqueCount++;
            }
        }
        
        return uniqueCount;
    }

    function _getUniqueActionCount() internal view returns (uint256) {
        bytes32[] memory uniqueActions = new bytes32[](auditLog.length);
        uint256 uniqueCount = 0;
        
        for (uint256 i = 0; i < auditLog.length; i++) {
            bool found = false;
            for (uint256 j = 0; j < uniqueCount; j++) {
                if (uniqueActions[j] == auditLog[i].action) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                uniqueActions[uniqueCount] = auditLog[i].action;
                uniqueCount++;
            }
        }
        
        return uniqueCount;
    }
} 