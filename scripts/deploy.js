const hre = require("hardhat");

async function main() {
  const AppToken = await hre.ethers.getContractFactory("AppToken");
  const appToken = await AppToken.deploy();

  await appToken.waitForDeployment();

  console.log(`✅ AppToken deployed at: ${appToken.target}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
