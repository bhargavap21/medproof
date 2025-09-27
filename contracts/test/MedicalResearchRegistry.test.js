const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedicalResearchRegistry", function () {
  let registry;
  let owner;
  let hospital1;
  let hospital2;
  let researcher;
  let unauthorized;

  beforeEach(async function () {
    [owner, hospital1, hospital2, researcher, unauthorized] = await ethers.getSigners();
    
    const MedicalResearchRegistry = await ethers.getContractFactory("MedicalResearchRegistry");
    registry = await MedicalResearchRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("Hospital Authorization", function () {
    it("Should authorize a hospital", async function () {
      await registry.authorizeHospital(
        hospital1.address,
        "Test Hospital",
        "Test Location"
      );

      const hospitalInfo = await registry.getHospitalInfo(hospital1.address);
      expect(hospitalInfo.authorized).to.be.true;
      expect(hospitalInfo.name).to.equal("Test Hospital");
      expect(hospitalInfo.location).to.equal("Test Location");
    });

    it("Should not allow non-owner to authorize hospital", async function () {
      await expect(
        registry.connect(hospital1).authorizeHospital(
          hospital2.address,
          "Test Hospital",
          "Test Location"
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should revoke hospital authorization", async function () {
      await registry.authorizeHospital(hospital1.address, "Test Hospital", "Test Location");
      await registry.revokeHospital(hospital1.address);

      const hospitalInfo = await registry.getHospitalInfo(hospital1.address);
      expect(hospitalInfo.authorized).to.be.false;
    });
  });

  describe("Proof Submission", function () {
    beforeEach(async function () {
      await registry.authorizeHospital(hospital1.address, "Test Hospital", "Test Location");
    });

    it("Should submit a research proof", async function () {
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("test-proof-1"));
      const zkProof = ethers.toUtf8Bytes("mock-zk-proof-data");

      await registry.connect(hospital1).submitProof(
        proofHash,
        "diabetes-treatment",
        "type-2-diabetes",
        1000,
        1200,
        70,
        85,
        zkProof
      );

      const proof = await registry.getProof(proofHash);
      expect(proof.hospital).to.equal(hospital1.address);
      expect(proof.studyType).to.equal("diabetes-treatment");
      expect(proof.condition).to.equal("type-2-diabetes");
      expect(proof.verified).to.be.false;
    });

    it("Should not allow unauthorized hospital to submit proof", async function () {
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("test-proof-1"));
      const zkProof = ethers.toUtf8Bytes("mock-zk-proof-data");

      await expect(
        registry.connect(unauthorized).submitProof(
          proofHash,
          "diabetes-treatment",
          "type-2-diabetes",
          1000,
          1200,
          70,
          85,
          zkProof
        )
      ).to.be.revertedWith("Hospital not authorized");
    });

    it("Should not allow duplicate proof submission", async function () {
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("test-proof-1"));
      const zkProof = ethers.toUtf8Bytes("mock-zk-proof-data");

      await registry.connect(hospital1).submitProof(
        proofHash,
        "diabetes-treatment",
        "type-2-diabetes",
        1000,
        1200,
        70,
        85,
        zkProof
      );

      await expect(
        registry.connect(hospital1).submitProof(
          proofHash,
          "diabetes-treatment",
          "type-2-diabetes",
          1000,
          1200,
          70,
          85,
          zkProof
        )
      ).to.be.revertedWith("Proof already exists");
    });
  });

  describe("Proof Verification", function () {
    let proofHash;

    beforeEach(async function () {
      await registry.authorizeHospital(hospital1.address, "Test Hospital", "Test Location");
      proofHash = ethers.keccak256(ethers.toUtf8Bytes("test-proof-1"));
      const zkProof = ethers.toUtf8Bytes("mock-zk-proof-data");

      await registry.connect(hospital1).submitProof(
        proofHash,
        "diabetes-treatment",
        "type-2-diabetes",
        1000,
        1200,
        70,
        85,
        zkProof
      );
    });

    it("Should verify a proof", async function () {
      await registry.verifyProof(proofHash);

      const proof = await registry.getProof(proofHash);
      expect(proof.verified).to.be.true;
    });

    it("Should not allow non-owner to verify proof", async function () {
      await expect(
        registry.connect(hospital1).verifyProof(proofHash)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Data Aggregation", function () {
    beforeEach(async function () {
      await registry.authorizeHospital(hospital1.address, "Hospital 1", "Location 1");
      await registry.authorizeHospital(hospital2.address, "Hospital 2", "Location 2");

      // Submit multiple proofs
      const proofHash1 = ethers.keccak256(ethers.toUtf8Bytes("proof-1"));
      const proofHash2 = ethers.keccak256(ethers.toUtf8Bytes("proof-2"));
      const zkProof = ethers.toUtf8Bytes("mock-zk-proof-data");

      await registry.connect(hospital1).submitProof(
        proofHash1,
        "diabetes-treatment",
        "type-2-diabetes",
        1000,
        1200,
        70,
        80,
        zkProof
      );

      await registry.connect(hospital2).submitProof(
        proofHash2,
        "diabetes-treatment",
        "type-2-diabetes",
        800,
        1000,
        75,
        85,
        zkProof
      );

      // Verify one proof
      await registry.verifyProof(proofHash1);
    });

    it("Should aggregate study results", async function () {
      const results = await registry.aggregateStudyResults("diabetes-treatment");

      expect(results.totalProofs).to.equal(2);
      expect(results.verifiedProofs).to.equal(1);
      expect(results.totalMinSamples).to.equal(1800); // 1000 + 800
      expect(results.totalMaxSamples).to.equal(2200); // 1200 + 1000
      expect(results.avgEffectivenessMin).to.equal(72); // (70 + 75) / 2
      expect(results.avgEffectivenessMax).to.equal(82); // (80 + 85) / 2
    });

    it("Should return zero for non-existent study type", async function () {
      const results = await registry.aggregateStudyResults("non-existent-study");

      expect(results.totalProofs).to.equal(0);
      expect(results.verifiedProofs).to.equal(0);
      expect(results.totalMinSamples).to.equal(0);
      expect(results.totalMaxSamples).to.equal(0);
    });
  });
});