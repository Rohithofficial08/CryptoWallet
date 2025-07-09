const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const provider = ethers.provider;
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const nonce = await provider.getTransactionCount(wallet.address); // fetch latest nonce
  console.log("Using nonce:", nonce);

  const AppToken = await hre.ethers.getContractFactory("AppToken", wallet);
  const appToken = await AppToken.deploy({ nonce });

  await appToken.waitForDeployment();

  console.log(`✅ AppToken deployed at: ${appToken.target}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
