import hardhat from "hardhat";
const {ethers} = hardhat;
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const backendWalletAddress = "0xD77390fD1a08f9713635Da78BE08BA56d0A840d8"; 
  const tokenAddress = process.env.TOKEN_CONTRACT_ADDRESS;

  const [deployer] = await ethers.getSigners();
  console.log("Current owner (deployer):", deployer.address);

  const Token = await ethers.getContractFactory("AppToken");
  const token = await Token.attach(tokenAddress);

  const tx = await token.transferOwnership(backendWalletAddress);
  await tx.wait();

  console.log("✅ Ownership transferred to:", await token.owner());
}

main().catch(console.error);
