// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./interfaces/IAdminRegistry.sol";

contract EmergencyManager {
    IAdminRegistry public adminRegistry;
    
    enum EmergencyLevel { None, Low, Medium, High, Critical }
    enum EmergencyType { None, Security, Technical, Compliance, Natural }
    
    struct Emergency {
        uint256 emergencyId;
        EmergencyLevel level;
        EmergencyType emergencyType;
        bytes32 reason;
        address declaredBy;
        uint256 declaredAt;
        uint256 resolvedAt;
        bool isResolved;
        string description;
        address[] involvedAdmins;
        uint256[] affectedContracts;
    }
    
    struct RecoveryPlan {
        uint256 planId;
        uint256 emergencyId;
        address newAdmin;
        address[] backupAdmins;
        uint256 activationTime;
        bool isActivated;
        string recoverySteps;
    }
    
    mapping(uint256 => Emergency) public emergencies;
    mapping(uint256 => RecoveryPlan) public recoveryPlans;
    mapping(address => bool) public backupAdmins;
    
    uint256 public totalEmergencies;
    uint256 public activeEmergencies;
    uint256 public totalRecoveryPlans;
    
    EmergencyLevel public currentEmergencyLevel;
    uint256 public lastEmergencyTime;
    
    // Events
    event EmergencyDeclared(
        uint256 indexed emergencyId,
        EmergencyLevel level,
        EmergencyType emergencyType,
        bytes32 reason,
        address indexed declaredBy,
        uint256 timestamp
    );
    event EmergencyResolved(
        uint256 indexed emergencyId,
        address indexed resolvedBy,
        uint256 timestamp
    );
    event EmergencyPaused(
        uint256 indexed emergencyId,
        address indexed pausedBy,
        uint256 timestamp
    );
    event EmergencyRecovered(
        uint256 indexed emergencyId,
        address indexed newAdmin,
        uint256 timestamp
    );
    event RecoveryPlanCreated(
        uint256 indexed planId,
        uint256 indexed emergencyId,
        address indexed newAdmin,
        uint256 timestamp
    );
    event RecoveryPlanActivated(
        uint256 indexed planId,
        address indexed newAdmin,
        uint256 timestamp
    );
    event BackupAdminAdded(address indexed admin, address indexed addedBy);
    event BackupAdminRemoved(address indexed admin, address indexed removedBy);

    modifier onlyAdmin() {
        (uint8 role, bool active) = adminRegistry.getAdminRoleAndStatus(msg.sender);
        require(active && role > 0, "Not admin");
        _;
    }

    modifier onlySuperAdmin() {
        (uint8 role, bool active) = adminRegistry.getAdminRoleAndStatus(msg.sender);
        require(active && role == 3, "Not super admin");
        _;
    }

    modifier onlyEmergencyAdmin() {
        require(adminRegistry.hasPermission(msg.sender, keccak256("EMERGENCY_MANAGEMENT")), "No emergency permission");
        _;
    }

    modifier whenNotInEmergency() {
        require(currentEmergencyLevel == EmergencyLevel.None, "System in emergency state");
        _;
    }

    constructor(address _adminRegistry) {
        adminRegistry = IAdminRegistry(_adminRegistry);
    }

    function declareEmergency(
        EmergencyLevel level,
        EmergencyType emergencyType,
        bytes32 reason,
        string memory description,
        address[] memory involvedAdmins,
        uint256[] memory affectedContracts
    ) external onlyEmergencyAdmin returns (uint256) {
        require(level != EmergencyLevel.None, "Invalid emergency level");
        require(emergencyType != EmergencyType.None, "Invalid emergency type");
        
        uint256 emergencyId = totalEmergencies + 1;
        
        emergencies[emergencyId] = Emergency({
            emergencyId: emergencyId,
            level: level,
            emergencyType: emergencyType,
            reason: reason,
            declaredBy: msg.sender,
            declaredAt: block.timestamp,
            resolvedAt: 0,
            isResolved: false,
            description: description,
            involvedAdmins: involvedAdmins,
            affectedContracts: affectedContracts
        });
        
        totalEmergencies++;
        activeEmergencies++;
        currentEmergencyLevel = level;
        lastEmergencyTime = block.timestamp;
        
        emit EmergencyDeclared(
            emergencyId,
            level,
            emergencyType,
            reason,
            msg.sender,
            block.timestamp
        );
        
        return emergencyId;
    }

    function resolveEmergency(uint256 emergencyId) external onlyEmergencyAdmin {
        Emergency storage emergency = emergencies[emergencyId];
        require(emergency.emergencyId != 0, "Emergency not found");
        require(!emergency.isResolved, "Emergency already resolved");
        
        emergency.isResolved = true;
        emergency.resolvedAt = block.timestamp;
        activeEmergencies--;
        
        // Reset emergency level if no active emergencies
        if (activeEmergencies == 0) {
            currentEmergencyLevel = EmergencyLevel.None;
        }
        
        emit EmergencyResolved(emergencyId, msg.sender, block.timestamp);
    }

    function emergencyPause(uint256 emergencyId) external onlyEmergencyAdmin {
        Emergency storage emergency = emergencies[emergencyId];
        require(emergency.emergencyId != 0, "Emergency not found");
        require(!emergency.isResolved, "Emergency already resolved");
        
        emit EmergencyPaused(emergencyId, msg.sender, block.timestamp);
    }

    function createRecoveryPlan(
        uint256 emergencyId,
        address newAdmin,
        address[] memory backupAdminsParam,
        string memory recoverySteps
    ) external onlySuperAdmin returns (uint256) {
        require(emergencies[emergencyId].emergencyId != 0, "Emergency not found");
        require(newAdmin != address(0), "Invalid new admin address");
        
        uint256 planId = totalRecoveryPlans + 1;
        
        recoveryPlans[planId] = RecoveryPlan({
            planId: planId,
            emergencyId: emergencyId,
            newAdmin: newAdmin,
            backupAdmins: backupAdminsParam,
            activationTime: 0,
            isActivated: false,
            recoverySteps: recoverySteps
        });
        
        totalRecoveryPlans++;
        
        emit RecoveryPlanCreated(planId, emergencyId, newAdmin, block.timestamp);
        
        return planId;
    }

    function activateRecoveryPlan(uint256 planId) external onlySuperAdmin {
        RecoveryPlan storage plan = recoveryPlans[planId];
        require(plan.planId != 0, "Recovery plan not found");
        require(!plan.isActivated, "Recovery plan already activated");
        
        plan.isActivated = true;
        plan.activationTime = block.timestamp;
        
        emit RecoveryPlanActivated(planId, plan.newAdmin, block.timestamp);
    }

    function emergencyRecovery(address newAdmin) external onlySuperAdmin {
        require(newAdmin != address(0), "Invalid new admin address");
        
        // This would typically involve more complex recovery logic
        // For now, we just emit the event
        emit EmergencyRecovered(0, newAdmin, block.timestamp);
    }

    function addBackupAdmin(address admin) external onlySuperAdmin {
        require(admin != address(0), "Invalid admin address");
        require(!backupAdmins[admin], "Already backup admin");
        
        backupAdmins[admin] = true;
        
        emit BackupAdminAdded(admin, msg.sender);
    }

    function removeBackupAdmin(address admin) external onlySuperAdmin {
        require(backupAdmins[admin], "Not backup admin");
        
        backupAdmins[admin] = false;
        
        emit BackupAdminRemoved(admin, msg.sender);
    }

    function getEmergency(uint256 emergencyId) external view returns (
        uint256 id,
        EmergencyLevel level,
        EmergencyType emergencyType,
        bytes32 reason,
        address declaredBy,
        uint256 declaredAt,
        uint256 resolvedAt,
        bool isResolved,
        string memory description
    ) {
        Emergency memory emergency = emergencies[emergencyId];
        return (
            emergency.emergencyId,
            emergency.level,
            emergency.emergencyType,
            emergency.reason,
            emergency.declaredBy,
            emergency.declaredAt,
            emergency.resolvedAt,
            emergency.isResolved,
            emergency.description
        );
    }

    function getRecoveryPlan(uint256 planId) external view returns (
        uint256 id,
        uint256 emergencyId,
        address newAdmin,
        address[] memory backupAdmins,
        uint256 activationTime,
        bool isActivated,
        string memory recoverySteps
    ) {
        RecoveryPlan memory plan = recoveryPlans[planId];
        return (
            plan.planId,
            plan.emergencyId,
            plan.newAdmin,
            plan.backupAdmins,
            plan.activationTime,
            plan.isActivated,
            plan.recoverySteps
        );
    }

    function getEmergencyStatistics() external view returns (
        uint256 total,
        uint256 active,
        EmergencyLevel currentLevel,
        uint256 lastEmergency,
        uint256 totalRecoveryPlansParam
    ) {
        return (
            totalEmergencies,
            activeEmergencies,
            currentEmergencyLevel,
            lastEmergencyTime,
            totalRecoveryPlans
        );
    }

    function getActiveEmergencies() external view returns (uint256[] memory) {
        uint256[] memory activeIds = new uint256[](activeEmergencies);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= totalEmergencies; i++) {
            if (emergencies[i].emergencyId != 0 && !emergencies[i].isResolved) {
                activeIds[count] = i;
                count++;
            }
        }
        
        return activeIds;
    }

    function isInEmergency() external view returns (bool) {
        return currentEmergencyLevel != EmergencyLevel.None;
    }

    function getEmergencyLevel() external view returns (EmergencyLevel) {
        return currentEmergencyLevel;
    }

    function isBackupAdmin(address admin) external view returns (bool) {
        return backupAdmins[admin];
    }

    function getBackupAdmins() external view returns (address[] memory) {
        // This is a simplified version - in production, you'd maintain a separate list
        address[] memory admins = new address[](10); // Assuming max 10 backup admins
        uint256 count = 0;
        
        // In a real implementation, you'd iterate through all backup admins
        // For now, return empty array
        return admins;
    }

    function updateEmergencyDescription(
        uint256 emergencyId,
        string memory newDescription
    ) external onlyEmergencyAdmin {
        require(emergencies[emergencyId].emergencyId != 0, "Emergency not found");
        
        emergencies[emergencyId].description = newDescription;
    }

    function addInvolvedAdmin(
        uint256 emergencyId,
        address admin
    ) external onlyEmergencyAdmin {
        Emergency storage emergency = emergencies[emergencyId];
        require(emergency.emergencyId != 0, "Emergency not found");
        require(!emergency.isResolved, "Emergency already resolved");
        
        emergency.involvedAdmins.push(admin);
    }

    function getInvolvedAdmins(uint256 emergencyId) external view returns (address[] memory) {
        return emergencies[emergencyId].involvedAdmins;
    }

    function getAffectedContracts(uint256 emergencyId) external view returns (uint256[] memory) {
        return emergencies[emergencyId].affectedContracts;
    }
} 