// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AppToken is ERC20, Ownable {
    event AppTransfer(
        address indexed from,
        address indexed to,
        uint256 value,
        string note,
        uint256 timestamp
    );

    constructor() ERC20("AppToken", "APT") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    /// @notice Mint tokens to a specific address (onlyOwner)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Burn your own tokens
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /// @notice Transfer tokens with a custom note (like UPI message)
    function transferWithNote(address to, uint256 amount, string calldata note) external returns (bool) {
        _transfer(msg.sender, to, amount);
        emit AppTransfer(msg.sender, to, amount, note, block.timestamp);
        return true;
    }

    /// @notice Standard ERC20 transfer overridden to include timestamp in event
    function transfer(address to, uint256 amount) public override returns (bool) {
        bool success = super.transfer(to, amount);
        if (success) {
            emit AppTransfer(msg.sender, to, amount, "", block.timestamp);
        }
        return success;
    }
}
