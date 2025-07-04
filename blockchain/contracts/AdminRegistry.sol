// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract AdminRegistry {
    enum Role { None, SupportAdmin, SystemAdmin, SuperAdmin }

    struct Admin {
        address account;
        Role role;
        bool active;
        uint256 createdAt;
        uint256 lastActive;
        string permissions; // JSON string of permissions
    }

    struct Permission {
        bytes32 name;
        bool granted;
        uint256 grantedAt;
        address grantedBy;
    }

    mapping(address => Admin) public admins;
    mapping(address => mapping(bytes32 => Permission)) public permissions;
    mapping(bytes32 => bool) public validPermissions;

    // Function to get admin role and active status
    function getAdminRoleAndStatus(address admin) public view returns (uint8 role, bool active) {
        Admin storage adminData = admins[admin];
        return (uint8(adminData.role), adminData.active);
    }
    
    address public owner;
    uint256 public totalAdmins;
    uint256 public activeAdmins;

    // Events
    event AdminAdded(address indexed admin, uint8 role, address indexed addedBy, uint256 timestamp);
    event AdminRemoved(address indexed admin, address indexed removedBy, uint256 timestamp);
    event AdminRoleUpdated(address indexed admin, uint8 oldRole, uint8 newRole, address indexed updatedBy);
    event PermissionGranted(address indexed admin, bytes32 permission, address indexed grantedBy);
    event PermissionRevoked(address indexed admin, bytes32 permission, address indexed revokedBy);
    event AdminActivity(address indexed admin, uint256 timestamp);

    // Modifiers
    modifier onlySuperAdmin() {
        require(admins[msg.sender].role == Role.SuperAdmin && admins[msg.sender].active, "Not super admin");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender].active && admins[msg.sender].role != Role.None, "Not admin");
        _;
    }

    modifier onlySystemAdmin() {
        require(admins[msg.sender].role == Role.SystemAdmin || admins[msg.sender].role == Role.SuperAdmin, "Not system admin");
        _;
    }

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = Admin({
            account: msg.sender,
            role: Role.SuperAdmin,
            active: true,
            createdAt: block.timestamp,
            lastActive: block.timestamp,
            permissions: ""
        });
        totalAdmins = 1;
        activeAdmins = 1;
        
        // Initialize default permissions
        _initializePermissions();
        
        emit AdminAdded(msg.sender, uint8(Role.SuperAdmin), msg.sender, block.timestamp);
    }

    function _initializePermissions() internal {
        validPermissions[keccak256("USER_MANAGEMENT")] = true;
        validPermissions[keccak256("ISSUER_MANAGEMENT")] = true;
        validPermissions[keccak256("VERIFIER_MANAGEMENT")] = true;
        validPermissions[keccak256("SYSTEM_CONFIG")] = true;
        validPermissions[keccak256("EMERGENCY_MANAGEMENT")] = true;
        validPermissions[keccak256("AUDIT_ACCESS")] = true;
        validPermissions[keccak256("BLOCKCHAIN_MANAGEMENT")] = true;
    }

    function addAdmin(address admin, uint8 role) external onlySuperAdmin {
        require(admin != address(0), "Invalid address");
        require(role > 0 && role <= uint8(Role.SuperAdmin), "Invalid role");
        require(!admins[admin].active, "Already admin");
        
        admins[admin] = Admin({
            account: admin,
            role: Role(role),
            active: true,
            createdAt: block.timestamp,
            lastActive: block.timestamp,
            permissions: ""
        });
        
        totalAdmins++;
        activeAdmins++;
        
        // Grant default permissions based on role
        _grantDefaultPermissions(admin, Role(role));
        
        emit AdminAdded(admin, role, msg.sender, block.timestamp);
    }

    function removeAdmin(address admin) external onlySuperAdmin {
        require(admins[admin].active, "Not an admin");
        require(admin != owner, "Cannot remove owner");
        
        admins[admin].active = false;
        activeAdmins--;
        
        emit AdminRemoved(admin, msg.sender, block.timestamp);
    }

    function updateAdminRole(address admin, uint8 newRole) external onlySuperAdmin {
        require(admins[admin].active, "Not an admin");
        require(newRole > 0 && newRole <= uint8(Role.SuperAdmin), "Invalid role");
        require(admin != owner || newRole == uint8(Role.SuperAdmin), "Owner must remain super admin");
        
        uint8 oldRole = uint8(admins[admin].role);
        admins[admin].role = Role(newRole);
        
        // Update permissions based on new role
        _updatePermissionsForRole(admin, Role(newRole));
        
        emit AdminRoleUpdated(admin, oldRole, newRole, msg.sender);
    }

    function grantPermission(address admin, bytes32 permission) external onlySystemAdmin {
        require(admins[admin].active, "Admin not active");
        require(validPermissions[permission], "Invalid permission");
        require(!permissions[admin][permission].granted, "Permission already granted");
        
        permissions[admin][permission] = Permission({
            name: permission,
            granted: true,
            grantedAt: block.timestamp,
            grantedBy: msg.sender
        });
        
        emit PermissionGranted(admin, permission, msg.sender);
    }

    function revokePermission(address admin, bytes32 permission) external onlySystemAdmin {
        require(permissions[admin][permission].granted, "Permission not granted");
        
        delete permissions[admin][permission];
        
        emit PermissionRevoked(admin, permission, msg.sender);
    }

    function hasPermission(address admin, bytes32 permission) external view returns (bool) {
        if (!admins[admin].active) return false;
        
        // Super admins have all permissions
        if (admins[admin].role == Role.SuperAdmin) return true;
        
        // Check specific permission
        return permissions[admin][permission].granted;
    }

    function getAdminRole(address admin) external view returns (uint8) {
        return uint8(admins[admin].role);
    }

    function getAdminInfo(address admin) external view returns (
        address account,
        uint8 role,
        bool active,
        uint256 createdAt,
        uint256 lastActive
    ) {
        Admin memory adminInfo = admins[admin];
        return (
            adminInfo.account,
            uint8(adminInfo.role),
            adminInfo.active,
            adminInfo.createdAt,
            adminInfo.lastActive
        );
    }

    function updateLastActive() external onlyAdmin {
        admins[msg.sender].lastActive = block.timestamp;
        emit AdminActivity(msg.sender, block.timestamp);
    }

    function getActiveAdmins() external view returns (address[] memory) {
        address[] memory activeAdminList = new address[](activeAdmins);
        uint256 count = 0;
        
        // This is a simplified version - in production, you'd want to maintain a separate list
        // For now, we'll return the owner as the only active admin
        if (admins[owner].active) {
            activeAdminList[count] = owner;
            count++;
        }
        
        return activeAdminList;
    }

    function _grantDefaultPermissions(address admin, Role role) internal {
        if (role == Role.SuperAdmin) {
            // Super admins get all permissions
            _grantPermission(admin, keccak256("USER_MANAGEMENT"));
            _grantPermission(admin, keccak256("ISSUER_MANAGEMENT"));
            _grantPermission(admin, keccak256("VERIFIER_MANAGEMENT"));
            _grantPermission(admin, keccak256("SYSTEM_CONFIG"));
            _grantPermission(admin, keccak256("EMERGENCY_MANAGEMENT"));
            _grantPermission(admin, keccak256("AUDIT_ACCESS"));
            _grantPermission(admin, keccak256("BLOCKCHAIN_MANAGEMENT"));
        } else if (role == Role.SystemAdmin) {
            // System admins get most permissions except emergency management
            _grantPermission(admin, keccak256("USER_MANAGEMENT"));
            _grantPermission(admin, keccak256("ISSUER_MANAGEMENT"));
            _grantPermission(admin, keccak256("VERIFIER_MANAGEMENT"));
            _grantPermission(admin, keccak256("SYSTEM_CONFIG"));
            _grantPermission(admin, keccak256("AUDIT_ACCESS"));
            _grantPermission(admin, keccak256("BLOCKCHAIN_MANAGEMENT"));
        } else if (role == Role.SupportAdmin) {
            // Support admins get limited permissions
            _grantPermission(admin, keccak256("USER_MANAGEMENT"));
            _grantPermission(admin, keccak256("AUDIT_ACCESS"));
        }
    }

    function _grantPermission(address admin, bytes32 permission) internal {
        permissions[admin][permission] = Permission({
            name: permission,
            granted: true,
            grantedAt: block.timestamp,
            grantedBy: msg.sender
        });
    }

    function _updatePermissionsForRole(address admin, Role role) internal {
        // Clear existing permissions
        delete permissions[admin][keccak256("USER_MANAGEMENT")];
        delete permissions[admin][keccak256("ISSUER_MANAGEMENT")];
        delete permissions[admin][keccak256("VERIFIER_MANAGEMENT")];
        delete permissions[admin][keccak256("SYSTEM_CONFIG")];
        delete permissions[admin][keccak256("EMERGENCY_MANAGEMENT")];
        delete permissions[admin][keccak256("AUDIT_ACCESS")];
        delete permissions[admin][keccak256("BLOCKCHAIN_MANAGEMENT")];
        
        // Grant new permissions based on role
        _grantDefaultPermissions(admin, role);
    }
} 