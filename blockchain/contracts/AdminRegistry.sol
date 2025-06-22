// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract AdminRegistry {
    enum Role { None, SupportAdmin, SystemAdmin, SuperAdmin }

    struct Admin {
        address account;
        Role role;
        bool active;
    }

    mapping(address => Admin) public admins;
    address public owner;

    event AdminAdded(address indexed admin, uint8 role, address indexed addedBy);
    event AdminRemoved(address indexed admin, address indexed removedBy);
    event AdminRoleUpdated(address indexed admin, uint8 oldRole, uint8 newRole);

    modifier onlySuperAdmin() {
        require(admins[msg.sender].role == Role.SuperAdmin, "Not super admin");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender].role == Role.SuperAdmin || admins[msg.sender].role == Role.SystemAdmin, "Not admin");
        _;
    }

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = Admin({ account: msg.sender, role: Role.SuperAdmin, active: true });
        emit AdminAdded(msg.sender, uint8(Role.SuperAdmin), msg.sender);
    }

    function addAdmin(address admin, uint8 role) external onlySuperAdmin {
        require(admin != address(0), "Invalid address");
        require(role > 0 && role <= uint8(Role.SuperAdmin), "Invalid role");
        require(!admins[admin].active, "Already admin");
        admins[admin] = Admin({ account: admin, role: Role(role), active: true });
        emit AdminAdded(admin, role, msg.sender);
    }

    function removeAdmin(address admin) external onlySuperAdmin {
        require(admins[admin].active, "Not an admin");
        admins[admin].active = false;
        emit AdminRemoved(admin, msg.sender);
    }

    function updateAdminRole(address admin, uint8 newRole) external onlySuperAdmin {
        require(admins[admin].active, "Not an admin");
        require(newRole > 0 && newRole <= uint8(Role.SuperAdmin), "Invalid role");
        uint8 oldRole = uint8(admins[admin].role);
        admins[admin].role = Role(newRole);
        emit AdminRoleUpdated(admin, oldRole, newRole);
    }

    function hasPermission(address admin, bytes32 permission) external view returns (bool) {
        // Example: implement permission matrix if needed
        // For now, any active admin has all permissions
        return admins[admin].active && admins[admin].role != Role.None;
    }

    function getAdminRole(address admin) external view returns (uint8) {
        return uint8(admins[admin].role);
    }
} 