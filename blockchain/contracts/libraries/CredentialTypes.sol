// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

library CredentialTypes {
    enum CredentialCategory {
        Government,
        Educational,
        Financial,
        Professional,
        Personal
    }

    enum CredentialType {
        // Government
        NationalID,
        VoterCard,
        TaxID,
        BirthCertificate,
        Passport,
        
        // Educational
        PrimarySchoolCert,
        BEPC,
        BAC,
        UniversityDiploma,
        ProfessionalCert,
        TrainingCert,
        
        // Financial
        BVN,
        CreditScore,
        IncomeCert,
        EmploymentLetter,
        
        // Professional
        ProfessionalLicense,
        WorkPermit,
        EmploymentCert,
        ProfessionalMembership,
        
        // Personal
        DrivingLicense,
        HealthCert,
        AgeVerification,
        AddressProof
    }

    struct CredentialMetadata {
        CredentialCategory category;
        string name;
        string description;
        uint256 validityPeriod; // in days
        bool requiresRenewal;
        bool requiresBiometric;
    }
}
