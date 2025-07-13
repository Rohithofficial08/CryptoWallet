import { ethers } from "ethers";
import tokenContract from "../config/contract.js";

export const getWalletBalance = async (req, res) => {
  const { wallet } = req.params;

  try {
    const rawBalance = await tokenContract.balanceOf(wallet);
    const decimals = await tokenContract.decimals();
    const balance = ethers.formatUnits(rawBalance, decimals);

    res.status(200).json({ wallet, balance });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ error: "Failed to fetch wallet balance" });
  }
};
