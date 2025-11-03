const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying MedProof contracts...");

  // Get the contract factory
  const MedicalResearchRegistry = await ethers.getContractFactory("MedicalResearchRegistry");

  // Deploy the contract
  const registry = await MedicalResearchRegistry.deploy();
  await registry.waitForDeployment();

  const registryAddress = await registry.getAddress();
  console.log("MedicalResearchRegistry deployed to:", registryAddress);

  // Verify deployment
  console.log("\nVerifying deployment...");
  const owner = await registry.owner();
  console.log("Contract owner:", owner);

  // Save deployment info
  const deploymentInfo = {
    networkName: hre.network.name,
    contractAddress: registryAddress,
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    deployer: owner
  };

  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Example: Authorize some test hospitals
  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    console.log("\nAuthorizing test hospitals...");
    
    const [deployer, hospital1, hospital2, hospital3] = await ethers.getSigners();
    
    await registry.authorizeHospital(
      hospital1.address,
      "Metropolitan General Hospital",
      "New York, NY"
    );
    
    await registry.authorizeHospital(
      hospital2.address,
      "Stanford Medical Center",
      "Stanford, CA"
    );
    
    await registry.authorizeHospital(
      hospital3.address,
      "Johns Hopkins Hospital",
      "Baltimore, MD"
    );
    
    console.log("Authorized 3 test hospitals");
    
    // Get authorized hospitals
    const authorizedHospitals = await registry.getAuthorizedHospitals();
    console.log("Authorized hospitals:", authorizedHospitals);
  }

  return registryAddress;
}

main()
  .then((address) => {
    console.log("\nDeployment completed successfully!");
    console.log("Contract address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });