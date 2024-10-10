// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

contract FundMe {
    address payable private immutable owner;
    address[] private funders;
    mapping(address => uint256) private funderAmounts;

    event WithdrawalLog(address receiver, uint256 amount);

    constructor() {
        owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only Owner can peform this action!");
        _;
    }

    function fund() public payable {
        require(msg.value > 10 gwei, "Must send more than 10 Gwei!");

        if (isNewFunder(msg.sender)) funders.push(msg.sender);
        funderAmounts[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No Ether to withdraw!");

        owner.transfer(contractBalance);
        resetAllFunderAmounts();

        emit WithdrawalLog(owner, contractBalance);
    }

    function withdrawToDistinctAddress(
        address payable _address,
        uint256 _amount
    ) public onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(contractBalance >= _amount, "Insufficient contract balance!");

        (bool success, ) = _address.call{value: _amount}("");
        require(success, "Failed to send Ether!");
        resetSomeFunderAmounts(_amount);

        emit WithdrawalLog(_address, _amount);
    }

    function isNewFunder(address _funder) internal view returns (bool) {
        uint256 totalFunders = getTotalFunders();
        for (uint256 i = 0; i < totalFunders; i++)
            if (funders[i] == _funder) return false;
        return true;
    }

    function resetAllFunderAmounts() internal {
        uint256 totalFunders = getTotalFunders();
        for (uint i = 0; i < totalFunders; i++) funderAmounts[funders[i]] = 0;
    }

    function resetSomeFunderAmounts(uint256 _amount) internal {
        uint256 amountLeft = _amount;
        uint256 totalFunders = getTotalFunders();
        for (uint256 i = 0; i < totalFunders; i++) {
            if (funderAmounts[funders[i]] < amountLeft) {
                amountLeft -= funderAmounts[funders[i]];
                funderAmounts[funders[i]] = 0;
            } else {
                funderAmounts[funders[i]] -= amountLeft;
                amountLeft = 0;
            }
            if (amountLeft == 0) return;
        }
    }

    function getTotalFunders() internal view returns (uint256) {
        return funders.length;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getFunders() public view returns (address[] memory) {
        return funders;
    }

    function getAllFunderAmounts()
        public
        view
        returns (address[] memory, uint256[] memory)
    {
        uint256 totalFunders = getTotalFunders();
        uint256[] memory allAmounts = new uint256[](totalFunders);
        for (uint256 i = 0; i < totalFunders; i++)
            allAmounts[i] = funderAmounts[funders[i]];

        return (funders, allAmounts);
    }
}
