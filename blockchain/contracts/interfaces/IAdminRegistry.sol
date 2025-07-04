// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

interface IAdminRegistry {
    enum Role { None, SupportAdmin, SystemAdmin, SuperAdmin }
    enum AdminRole {
        None,
        BasicAdmin,
        SystemAdmin,
        SuperAdmin
    }

    event AdminAdded(address indexed admin, AdminRole role);
    event AdminRemoved(address indexed admin);
    event AdminRoleUpdated(address indexed admin, AdminRole oldRole, AdminRole newRole);
    event EmergencyAdminAdded(address indexed admin);
    event EmergencyAdminRemoved(address indexed admin);

    struct Admin {
        address account;
        Role role;
        bool active;
        uint256 createdAt;
        uint256 lastActive;
        string permissions;
    }

    function addAdmin(address admin, AdminRole role) external;
    function removeAdmin(address admin) external;
    function updateAdminRole(address admin, AdminRole role) external;
    function addEmergencyAdmin(address admin) external;
    function removeEmergencyAdmin(address admin) external;
    function isAdmin(address admin) external view returns (bool);
    function getAdminRole(address admin) external view returns (AdminRole);
    function isEmergencyAdmin(address admin) external view returns (bool);
    function admins(address admin) external view returns (bool exists, AdminRole role, bool active);
    function emergencyAdmins(address admin) external view returns (bool exists, bool active);
    function getEmergencyAdmins() external view returns (address[] memory);
    function hasPermission(address admin, bytes32 permission) external view returns (bool);
    function getAdminInfo(address admin) external view returns (
        address account,
        uint8 role,
        bool active,
        uint256 createdAt,
        uint256 lastActive
    );
    function getAdminRoleAndStatus(address admin) external view returns (uint8 role, bool active);
    function getActiveAdmins() external view returns (address[] memory);
    function totalAdmins() external view returns (uint256);
    function activeAdmins() external view returns (uint256);
} 