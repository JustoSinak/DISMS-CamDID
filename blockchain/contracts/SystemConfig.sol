// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

interface IAdminRegistry {
    function admins(address) external view returns (address, uint8, bool);
}

contract SystemConfig {
    IAdminRegistry public adminRegistry;
    mapping(bytes32 => bytes32) private config;
    bool private paused;

    event ConfigUpdated(bytes32 indexed key, bytes32 value, address indexed updatedBy);
    event SystemPaused(address indexed by);
    event SystemUnpaused(address indexed by);

    modifier onlyAdmin() {
        (, uint8 role, bool active) = adminRegistry.admins(msg.sender);
        require(active && role > 0, "Not admin");
        _;
    }

    constructor(address _adminRegistry) {
        adminRegistry = IAdminRegistry(_adminRegistry);
    }

    function updateConfig(bytes32 key, bytes32 value) external onlyAdmin {
        config[key] = value;
        emit ConfigUpdated(key, value, msg.sender);
    }

    function getConfig(bytes32 key) external view returns (bytes32) {
        return config[key];
    }

    function pauseSystem() external onlyAdmin {
        paused = true;
        emit SystemPaused(msg.sender);
    }

    function unpauseSystem() external onlyAdmin {
        paused = false;
        emit SystemUnpaused(msg.sender);
    }

    function isSystemPaused() external view returns (bool) {
        return paused;
    }
} 