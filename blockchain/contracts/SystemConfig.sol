// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./interfaces/IAdminRegistry.sol";

contract SystemConfig {
    IAdminRegistry public adminRegistry;
    
    struct ConfigValue {
        bytes32 value;
        uint256 updatedAt;
        address updatedBy;
        string description;
    }
    
    struct SystemMetrics {
        uint256 totalTransactions;
        uint256 activeUsers;
        uint256 totalCredentials;
        uint256 lastUpdate;
    }
    
    mapping(bytes32 => ConfigValue) private config;
    mapping(bytes32 => bool) private configKeys;
    bytes32[] private allConfigKeys;
    
    SystemMetrics public metrics;
    bool private paused;
    uint256 public lastConfigUpdate;
    uint256 public emergencyPauseTime;
    
    // Events
    event ConfigUpdated(bytes32 indexed key, bytes32 value, address indexed updatedBy, uint256 timestamp);
    event ConfigRemoved(bytes32 indexed key, address indexed removedBy, uint256 timestamp);
    event SystemPaused(address indexed by, uint256 timestamp);
    event SystemUnpaused(address indexed by, uint256 timestamp);
    event MetricsUpdated(uint256 totalTransactions, uint256 activeUsers, uint256 totalCredentials, uint256 timestamp);
    event EmergencyPause(address indexed by, uint256 timestamp);

    modifier onlyAdmin() {
        (bool exists, IAdminRegistry.AdminRole role, bool active) = adminRegistry.admins(msg.sender);
        require(exists && active && role != IAdminRegistry.AdminRole.None, "Not admin");
        _;
    }

    modifier onlySystemAdmin() {
        (bool exists, IAdminRegistry.AdminRole role, bool active) = adminRegistry.admins(msg.sender);
        require(exists && active && (role == IAdminRegistry.AdminRole.SystemAdmin || role == IAdminRegistry.AdminRole.SuperAdmin), "Not system admin");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "System is paused");
        _;
    }

    constructor(address _adminRegistry) {
        adminRegistry = IAdminRegistry(_adminRegistry);
        _initializeDefaultConfig();
    }

    function _initializeDefaultConfig() internal {
        // Initialize default configuration values
        _setConfig("MAX_CREDENTIALS_PER_USER", bytes32(uint256(10)), "Maximum credentials per user");
        _setConfig("CREDENTIAL_EXPIRY_DAYS", bytes32(uint256(365)), "Default credential expiry in days");
        _setConfig("MIN_TRUST_SCORE", bytes32(uint256(70)), "Minimum trust score for verification");
        _setConfig("MAX_VERIFICATION_ATTEMPTS", bytes32(uint256(3)), "Maximum verification attempts per day");
        _setConfig("GAS_LIMIT", bytes32(uint256(3000000)), "Default gas limit for transactions");
        _setConfig("EMERGENCY_PAUSE_DURATION", bytes32(uint256(3600)), "Emergency pause duration in seconds");
        _setConfig("SYSTEM_VERSION", bytes32(uint256(100)), "System version (1.0.0)");
        _setConfig("MAINTENANCE_MODE", bytes32(uint256(0)), "Maintenance mode (0=off, 1=on)");
    }

    function updateConfig(bytes32 key, bytes32 value, string memory description) external onlySystemAdmin {
        _setConfig(key, value, description);
        emit ConfigUpdated(key, value, msg.sender, block.timestamp);
    }

    function getConfig(bytes32 key) external view returns (bytes32) {
        return config[key].value;
    }

    function getConfigInfo(bytes32 key) external view returns (
        bytes32 value,
        uint256 updatedAt,
        address updatedBy,
        string memory description
    ) {
        ConfigValue memory configValue = config[key];
        return (
            configValue.value,
            configValue.updatedAt,
            configValue.updatedBy,
            configValue.description
        );
    }

    function getAllConfigKeys() external view returns (bytes32[] memory) {
        return allConfigKeys;
    }

    function removeConfig(bytes32 key) external onlySystemAdmin {
        require(configKeys[key], "Config key does not exist");
        
        delete config[key];
        delete configKeys[key];
        
        // Remove from allConfigKeys array
        for (uint256 i = 0; i < allConfigKeys.length; i++) {
            if (allConfigKeys[i] == key) {
                allConfigKeys[i] = allConfigKeys[allConfigKeys.length - 1];
                allConfigKeys.pop();
                break;
            }
        }
        
        emit ConfigRemoved(key, msg.sender, block.timestamp);
    }

    function pauseSystem() external onlySystemAdmin {
        require(!paused, "System already paused");
        paused = true;
        lastConfigUpdate = block.timestamp;
        emit SystemPaused(msg.sender, block.timestamp);
    }

    function unpauseSystem() external onlySystemAdmin {
        require(paused, "System not paused");
        paused = false;
        lastConfigUpdate = block.timestamp;
        emit SystemUnpaused(msg.sender, block.timestamp);
    }

    function emergencyPause() external onlyAdmin {
        paused = true;
        emergencyPauseTime = block.timestamp;
        lastConfigUpdate = block.timestamp;
        emit EmergencyPause(msg.sender, block.timestamp);
    }

    function isSystemPaused() external view returns (bool) {
        return paused;
    }

    function getPauseInfo() external view returns (
        bool isPaused,
        uint256 pauseTime,
        uint256 emergencyPauseTimestamp
    ) {
        return (paused, lastConfigUpdate, emergencyPauseTime);
    }

    function updateMetrics(
        uint256 totalTransactions,
        uint256 activeUsers,
        uint256 totalCredentials
    ) external onlyAdmin {
        metrics = SystemMetrics({
            totalTransactions: totalTransactions,
            activeUsers: activeUsers,
            totalCredentials: totalCredentials,
            lastUpdate: block.timestamp
        });
        
        emit MetricsUpdated(totalTransactions, activeUsers, totalCredentials, block.timestamp);
    }

    function getMetrics() external view returns (
        uint256 totalTransactions,
        uint256 activeUsers,
        uint256 totalCredentials,
        uint256 lastUpdate
    ) {
        return (
            metrics.totalTransactions,
            metrics.activeUsers,
            metrics.totalCredentials,
            metrics.lastUpdate
        );
    }

    function getSystemStatus() external view returns (
        bool isPaused,
        uint256 lastUpdate,
        uint256 totalConfigKeys,
        uint256 systemVersion
    ) {
        return (
            paused,
            lastConfigUpdate,
            allConfigKeys.length,
            uint256(config["SYSTEM_VERSION"].value)
        );
    }

    function isMaintenanceMode() external view returns (bool) {
        return uint256(config["MAINTENANCE_MODE"].value) == 1;
    }

    function setMaintenanceMode(bool enabled) external onlySystemAdmin {
        bytes32 value = bytes32(uint256(enabled ? 1 : 0));
        _setConfig("MAINTENANCE_MODE", value, "Maintenance mode setting");
        emit ConfigUpdated("MAINTENANCE_MODE", value, msg.sender, block.timestamp);
    }

    function getConfigCount() external view returns (uint256) {
        return allConfigKeys.length;
    }

    function _setConfig(bytes32 key, bytes32 value, string memory description) internal {
        if (!configKeys[key]) {
            configKeys[key] = true;
            allConfigKeys.push(key);
        }
        
        config[key] = ConfigValue({
            value: value,
            updatedAt: block.timestamp,
            updatedBy: msg.sender,
            description: description
        });
        
        lastConfigUpdate = block.timestamp;
    }

    // Batch operations for efficiency
    function batchUpdateConfig(
        bytes32[] memory keys,
        bytes32[] memory values,
        string[] memory descriptions
    ) external onlySystemAdmin {
        require(
            keys.length == values.length && keys.length == descriptions.length,
            "Array lengths must match"
        );
        
        for (uint256 i = 0; i < keys.length; i++) {
            _setConfig(keys[i], values[i], descriptions[i]);
            emit ConfigUpdated(keys[i], values[i], msg.sender, block.timestamp);
        }
    }
} 