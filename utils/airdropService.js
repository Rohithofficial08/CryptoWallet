import { ethers } from "ethers";
import tokenContract from "../config/contractwithSigner.js";
import { faucetWallet } from "../config/provider.js";

export const airdropToNewUser = async (walletAddress) => {
  try {
    const mintTx = await tokenContract.mint(walletAddress, ethers.parseUnits("50", 18));
    await mintTx.wait();

    const gasTx = await faucetWallet.sendTransaction({
      to: walletAddress,
      value: ethers.parseEther("0.003"),
    });
    await gasTx.wait();

    console.log(`✅ Airdrop successful to ${walletAddress}`);
    return true;
  } catch (err) {
    console.error("❌ Airdrop failed:", err);
    return false;
  }
};
