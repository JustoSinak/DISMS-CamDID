// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

interface IAdminRegistry {
    function admins(address) external view returns (address, uint8, bool);
}

contract EmergencyManager {
    IAdminRegistry public adminRegistry;
    bool public emergency;
    address public recoveryAdmin;
    bytes32 public lastReason;

    event EmergencyDeclared(address indexed by, bytes32 reason);
    event EmergencyResolved(address indexed by);
    event EmergencyPaused(address indexed by);
    event EmergencyRecovered(address indexed newAdmin);

    modifier onlyAdmin() {
        (, uint8 role, bool active) = adminRegistry.admins(msg.sender);
        require(active && role > 0, "Not admin");
        _;
    }
    modifier onlySuperAdmin() {
        (, uint8 role, bool active) = adminRegistry.admins(msg.sender);
        require(active && role == 3, "Not super admin");
        _;
    }

    constructor(address _adminRegistry) {
        adminRegistry = IAdminRegistry(_adminRegistry);
    }

    function declareEmergency(bytes32 reason) external onlyAdmin {
        emergency = true;
        lastReason = reason;
        emit EmergencyDeclared(msg.sender, reason);
    }

    function resolveEmergency() external onlyAdmin {
        emergency = false;
        emit EmergencyResolved(msg.sender);
    }

    function emergencyPause() external onlyAdmin {
        emergency = true;
        emit EmergencyPaused(msg.sender);
    }

    function emergencyRecovery(address newAdmin) external onlySuperAdmin {
        recoveryAdmin = newAdmin;
        emit EmergencyRecovered(newAdmin);
    }
} 