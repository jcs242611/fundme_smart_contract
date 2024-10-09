const { expect } = require("chai");
const { deployFundMe } = require("../scripts/deployHelper");
const { ethers } = require("hardhat");

describe("Fund Me Smart Contract", function () {
  let fundMe;
  let acct1, acct2, acct3;

  beforeEach(async () => {
    const deployment = await deployFundMe();
    fundMe = deployment.fundMe;
    [acct1, acct2, acct3] = deployment.accounts;
  });

  it("Contract owner is equal to the contract deployer", async () => {
    const owner = await fundMe.getOwner();

    expect(owner).to.equal(acct1.address);
  });

  it("Correct amount of funds getting transferred to contract", async () => {
    const fundAmount = ethers.parseUnits("11", "gwei");
    await fundMe.connect(acct2).fund({ value: fundAmount });

    const contractAddress = await fundMe.getAddress();
    const contractBalance = await ethers.provider.getBalance(contractAddress);

    expect(contractBalance).to.equal(fundAmount);
  });

  it("Failed transaction if the ETH sent is less than 10 Gwei", async () => {
    const fundAmount = ethers.parseUnits("9", "gwei");

    await expect(
      fundMe.connect(acct2).fund({ value: fundAmount })
    ).to.be.revertedWith("Must send more than 10 Gwei!");
  });

  it("Owner able to withdraw full funds from the contract", async () => {
    await fundMe
      .connect(acct2)
      .fund({ value: ethers.parseUnits("12", "gwei") });
    await fundMe
      .connect(acct2)
      .fund({ value: ethers.parseUnits("25", "gwei") });
    await fundMe
      .connect(acct3)
      .fund({ value: ethers.parseUnits("18", "gwei") });

    const contractAddress = await fundMe.getAddress();

    const contractBalanceBeforeWithdraw = await ethers.provider.getBalance(
      contractAddress
    );
    const ownerBalanceBeforeWithdraw = await ethers.provider.getBalance(
      acct1.address
    );

    const tx = await fundMe.connect(acct1).withdraw();
    const receipt = await tx.wait();
    const gasCost = receipt.gasUsed * receipt.gasPrice;

    const contractBalanceAfterWithdraw = await ethers.provider.getBalance(
      contractAddress
    );
    const ownerBalanceAfterWithdraw = await ethers.provider.getBalance(
      acct1.address
    );

    expect(contractBalanceAfterWithdraw).to.equal(0);
    expect(ownerBalanceAfterWithdraw).to.equal(
      ownerBalanceBeforeWithdraw + contractBalanceBeforeWithdraw - gasCost
    );

    const [funders, allAmounts] = await fundMe
      .connect(acct1)
      .getAllFunderAmounts();
    for (let i = 0; i < funders.length; i++) {
      expect(allAmounts[i]).to.equal(0);
    }
  });

  it("Owner able to withdraw funds to a distinct address", async () => {});

  it("Failed Withdraw attempt for wrong owner", async () => {});
});
