import { ethers } from "ethers";
import dotenv from "dotenv";
import contractJson from "../artifacts/contracts/AppToken.sol/AppToken.json" assert { type: "json" };

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.BLOCKDAG_RPC);

const tokenContract = new ethers.Contract(
  process.env.TOKEN_CONTRACT_ADDRESS,
  contractJson.abi,
  provider // Read-only
);

export default tokenContract;
