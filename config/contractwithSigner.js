import { ethers } from "ethers";
import { faucetWallet } from "./provider.js";
import contractJson from "../artifacts/contracts/AppToken.sol/AppToken.json" assert { type: "json" };
import dotenv from "dotenv";
dotenv.config();

const contractWithSigner = new ethers.Contract(
  process.env.TOKEN_CONTRACT_ADDRESS,
  contractJson.abi,
  faucetWallet 
);

export default contractWithSigner;
