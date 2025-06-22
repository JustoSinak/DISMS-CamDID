// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

interface IAdminRegistry {
    function admins(address) external view returns (address, uint8, bool);
} 