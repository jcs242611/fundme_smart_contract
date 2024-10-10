const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("hardhat");

module.exports = buildModule("FundMeModule", (m) => {
  const fund2024JCS2611 = m.contract("FundMe");

  m.call(fund2024JCS2611, "fund", [], {
    value: ethers.parseUnits("13", "gwei"),
    from: m.getAccount(2),
  });

  return { fund2024JCS2611 };
});
