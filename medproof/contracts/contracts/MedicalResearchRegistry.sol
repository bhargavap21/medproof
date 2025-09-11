// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MedicalResearchRegistry is Ownable, ReentrancyGuard {
    struct ResearchProof {
        bytes32 proofHash;
        address hospital;
        string studyType;
        string condition;
        uint256 timestamp;
        bool verified;
        uint256 sampleSizeMin;
        uint256 sampleSizeMax;
        uint256 effectivenessMin;
        uint256 effectivenessMax;
        bytes zkProof;
    }
    
    struct Hospital {
        address hospitalAddress;
        string name;
        string location;
        bool authorized;
        uint256 totalProofs;
    }
    
    mapping(bytes32 => ResearchProof) public proofs;
    mapping(address => Hospital) public hospitals;
    mapping(string => bytes32[]) public studyTypeProofs;
    mapping(string => bytes32[]) public conditionProofs;
    
    bytes32[] public allProofs;
    address[] public authorizedHospitals;
    
    event ProofSubmitted(
        bytes32 indexed proofHash,
        address indexed hospital,
        string studyType,
        string condition,
        uint256 timestamp
    );
    
    event ProofVerified(bytes32 indexed proofHash, bool verified);
    event HospitalAuthorized(address indexed hospital, string name);
    event HospitalRevoked(address indexed hospital);
    
    modifier onlyAuthorizedHospital() {
        require(hospitals[msg.sender].authorized, "Hospital not authorized");
        _;
    }
    
    constructor() {}
    
    function authorizeHospital(
        address hospitalAddress,
        string memory name,
        string memory location
    ) public onlyOwner {
        require(!hospitals[hospitalAddress].authorized, "Hospital already authorized");
        
        hospitals[hospitalAddress] = Hospital({
            hospitalAddress: hospitalAddress,
            name: name,
            location: location,
            authorized: true,
            totalProofs: 0
        });
        
        authorizedHospitals.push(hospitalAddress);
        emit HospitalAuthorized(hospitalAddress, name);
    }
    
    function revokeHospital(address hospitalAddress) public onlyOwner {
        require(hospitals[hospitalAddress].authorized, "Hospital not authorized");
        hospitals[hospitalAddress].authorized = false;
        emit HospitalRevoked(hospitalAddress);
    }
    
    function submitProof(
        bytes32 proofHash,
        string memory studyType,
        string memory condition,
        uint256 sampleSizeMin,
        uint256 sampleSizeMax,
        uint256 effectivenessMin,
        uint256 effectivenessMax,
        bytes memory zkProof
    ) public onlyAuthorizedHospital nonReentrant {
        require(proofs[proofHash].timestamp == 0, "Proof already exists");
        require(sampleSizeMin <= sampleSizeMax, "Invalid sample size range");
        require(effectivenessMin <= effectivenessMax, "Invalid effectiveness range");
        
        ResearchProof memory newProof = ResearchProof({
            proofHash: proofHash,
            hospital: msg.sender,
            studyType: studyType,
            condition: condition,
            timestamp: block.timestamp,
            verified: false,
            sampleSizeMin: sampleSizeMin,
            sampleSizeMax: sampleSizeMax,
            effectivenessMin: effectivenessMin,
            effectivenessMax: effectivenessMax,
            zkProof: zkProof
        });
        
        proofs[proofHash] = newProof;
        allProofs.push(proofHash);
        studyTypeProofs[studyType].push(proofHash);
        conditionProofs[condition].push(proofHash);
        hospitals[msg.sender].totalProofs++;
        
        emit ProofSubmitted(proofHash, msg.sender, studyType, condition, block.timestamp);
    }
    
    function verifyProof(bytes32 proofHash) public onlyOwner {
        require(proofs[proofHash].timestamp != 0, "Proof does not exist");
        require(!proofs[proofHash].verified, "Proof already verified");
        
        proofs[proofHash].verified = true;
        emit ProofVerified(proofHash, true);
    }
    
    function getProof(bytes32 proofHash) public view returns (ResearchProof memory) {
        require(proofs[proofHash].timestamp != 0, "Proof does not exist");
        return proofs[proofHash];
    }
    
    function getStudyProofs(string memory studyType) public view returns (bytes32[] memory) {
        return studyTypeProofs[studyType];
    }
    
    function getConditionProofs(string memory condition) public view returns (bytes32[] memory) {
        return conditionProofs[condition];
    }
    
    function getAllProofs() public view returns (bytes32[] memory) {
        return allProofs;
    }
    
    function getAuthorizedHospitals() public view returns (address[] memory) {
        return authorizedHospitals;
    }
    
    function getHospitalInfo(address hospitalAddress) public view returns (Hospital memory) {
        return hospitals[hospitalAddress];
    }
    
    function aggregateStudyResults(string memory studyType) 
        public 
        view 
        returns (
            uint256 totalProofs,
            uint256 verifiedProofs,
            uint256 totalMinSamples,
            uint256 totalMaxSamples,
            uint256 avgEffectivenessMin,
            uint256 avgEffectivenessMax
        ) 
    {
        bytes32[] memory studyProofs = studyTypeProofs[studyType];
        totalProofs = studyProofs.length;
        
        if (totalProofs == 0) {
            return (0, 0, 0, 0, 0, 0);
        }
        
        uint256 sumEffMin = 0;
        uint256 sumEffMax = 0;
        
        for (uint256 i = 0; i < totalProofs; i++) {
            ResearchProof memory proof = proofs[studyProofs[i]];
            
            if (proof.verified) {
                verifiedProofs++;
            }
            
            totalMinSamples += proof.sampleSizeMin;
            totalMaxSamples += proof.sampleSizeMax;
            sumEffMin += proof.effectivenessMin;
            sumEffMax += proof.effectivenessMax;
        }
        
        avgEffectivenessMin = sumEffMin / totalProofs;
        avgEffectivenessMax = sumEffMax / totalProofs;
    }
}