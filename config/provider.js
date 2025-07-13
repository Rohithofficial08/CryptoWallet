import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

export const provider = new ethers.JsonRpcProvider(process.env.BLOCKDAG_RPC);

export const faucetWallet = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  provider
);
