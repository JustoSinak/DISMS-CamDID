// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

interface IAdminRegistry {
    enum Role { None, SupportAdmin, SystemAdmin, SuperAdmin }

    struct Admin {
        address account;
        Role role;
        bool active;
        uint256 createdAt;
        uint256 lastActive;
        string permissions;
    }

    function admins(address admin) external view returns (Admin memory);
    function hasPermission(address admin, bytes32 permission) external view returns (bool);
    function getAdminRole(address admin) external view returns (uint8);
    function getAdminInfo(address admin) external view returns (
        address account,
        uint8 role,
        bool active,
        uint256 createdAt,
        uint256 lastActive
    );
    function getActiveAdmins() external view returns (address[] memory);
    function totalAdmins() external view returns (uint256);
    function activeAdmins() external view returns (uint256);
} 