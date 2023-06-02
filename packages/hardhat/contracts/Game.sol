//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract Game {
    // State Variables
    address public immutable owner;
    uint256 public points = 0;

    constructor(address _owner) {
        owner = _owner;
    }

    function earnPoint() public {
        points += 1;
    }

    // Modifier: used to define a set of rules that must be met before or after a function is executed
    // Check the withdraw() function
    modifier isOwner() {
        // msg.sender: predefined variable that represents address of the account that called the current function
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    
    /**
     * Function that allows the owner to withdraw all the Ether in the contract
     * The function can only be called by the owner of the contract as defined by the isOwner modifier
     */
    function withdraw() isOwner public {
        (bool success,) = owner.call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable {}
}
