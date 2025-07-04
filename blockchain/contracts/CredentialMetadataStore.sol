// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./libraries/CredentialTypes.sol";

contract CredentialMetadataStore {
    using CredentialTypes for *;

    mapping(CredentialTypes.CredentialType => CredentialTypes.CredentialMetadata) private credentialMetadata;

    constructor() {
        // Government
        credentialMetadata[CredentialTypes.CredentialType.NationalID] = CredentialTypes.CredentialMetadata(
            CredentialTypes.CredentialCategory.Government,
            "National ID Card",
            "Cameroonian National ID Card",
            10 * 365,
            true,
            true
        );
        credentialMetadata[CredentialTypes.CredentialType.VoterCard] = CredentialTypes.CredentialMetadata(
            CredentialTypes.CredentialCategory.Government,
            "Voter Registration Card",
            "Cameroonian Voter Registration Card",
            5 * 365,
            true,
            false
        );

        // Educational
        credentialMetadata[CredentialTypes.CredentialType.BEPC] = CredentialTypes.CredentialMetadata(
            CredentialTypes.CredentialCategory.Educational,
            "BEPC",
            unicode"Brevet d'Études du Premier Cycle",
            0, // permanent
            false,
            false
        );
        credentialMetadata[CredentialTypes.CredentialType.BAC] = CredentialTypes.CredentialMetadata(
            CredentialTypes.CredentialCategory.Educational,
            "BAC",
            unicode"Baccalauréat",
            0, // permanent
            false,
            false
        );

        // Financial
        credentialMetadata[CredentialTypes.CredentialType.BVN] = CredentialTypes.CredentialMetadata(
            CredentialTypes.CredentialCategory.Financial,
            "Bank Verification Number",
            "Unique identifier for banking services",
            0, // permanent
            false,
            false
        );

        // Professional
        credentialMetadata[CredentialTypes.CredentialType.ProfessionalLicense] = CredentialTypes.CredentialMetadata(
            CredentialTypes.CredentialCategory.Professional,
            "Professional License",
            "License to practice profession",
            2 * 365,
            true,
            false
        );

        // Personal
        credentialMetadata[CredentialTypes.CredentialType.DrivingLicense] = CredentialTypes.CredentialMetadata(
            CredentialTypes.CredentialCategory.Personal,
            "Driving License",
            "License to operate motor vehicles",
            5 * 365,
            true,
            true
        );
    }

    function getCredentialMetadata(CredentialTypes.CredentialType _type) public view returns (CredentialTypes.CredentialMetadata memory) {
        return credentialMetadata[_type];
    }
}
