const { ethers } = require("hardhat");

async function deployFundMe() {
  const FundMe = await ethers.getContractFactory("FundMe");
  const fundMe = await FundMe.deploy();

  const accounts = await ethers.getSigners();

  return { fundMe, accounts: accounts.slice(0, 3) };
}

module.exports = { deployFundMe };
