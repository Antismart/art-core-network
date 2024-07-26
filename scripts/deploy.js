const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", hre.ethers.utils.formatEther(balance));

  // Load previously deployed contracts
  let deployedContracts = {};
  try {
    deployedContracts = JSON.parse(fs.readFileSync('deployed-contracts.json', 'utf8'));
  } catch (error) {
    console.log("No previously deployed contracts found.");
  }

  // Helper function to deploy a contract
  async function deployContract(name, ...args) {
    if (deployedContracts[name]) {
      console.log(`${name} already deployed at:`, deployedContracts[name]);
      return { address: deployedContracts[name] };
    }
    const Contract = await hre.ethers.getContractFactory(name);
    const contract = await Contract.deploy(...args);
    await contract.deployed();
    console.log(`${name} deployed to:`, contract.address);
    deployedContracts[name] = contract.address;
    fs.writeFileSync('deployed-contracts.json', JSON.stringify(deployedContracts, null, 2));
    return contract;
  }

  // Deploy contracts
  try {
    // CoreToken
    const initialSupply = hre.ethers.utils.parseUnits("1000000", 18);
    const coreToken = await deployContract("CoreToken", initialSupply);

    // TimelockController
    const minDelay = 3600; // 1 hour
    const proposers = [deployer.address];
    const executors = [deployer.address];
    const admin = ethers.constants.AddressZero;
    const timelock = await deployContract("TimelockController", minDelay, proposers, executors, admin);

    // Other contracts
    const platformFee = 500; // 5%
    await deployContract("ArtistProfile");
    await deployContract("Artwork");
    await deployContract("SocialInteractions");
    await deployContract("Governance", coreToken.address, timelock.address);
    await deployContract("Staking", coreToken.address, coreToken.address);
    await deployContract("LiquidityPool", coreToken.address, coreToken.address);

    const interestRate = 500; // 5% annual interest rate in basis points
    const loanDuration = 30 * 24 * 60 * 60; // 30 days in seconds
    await deployContract("ArtLoan", coreToken.address, deployedContracts["Artwork"], interestRate, loanDuration);

    await deployContract("TokenDistribution", coreToken.address);

    // ChainlinkIntegration
    const priceFeedAddress = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
    const vrfCoordinatorAddress = "0xf0d54349aDdcf704F77AE15b96510dEA15cb7952";
    const linkTokenAddress = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
    const keyHash = "0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445";
    const fee = hre.ethers.utils.parseEther("2");
    await deployContract("ChainlinkIntegration", priceFeedAddress, vrfCoordinatorAddress, linkTokenAddress, keyHash, fee);

    await deployContract("Marketplace", coreToken.address, platformFee);

    // CorePlatform
    await deployContract(
      "CorePlatform",
      deployedContracts["ArtistProfile"],
      deployedContracts["Artwork"],
      deployedContracts["Marketplace"],
      deployedContracts["SocialInteractions"],
      deployedContracts["Governance"],
      deployedContracts["Staking"],
      deployedContracts["LiquidityPool"],
      deployedContracts["ArtLoan"],
      deployedContracts["TokenDistribution"],
      deployedContracts["ChainlinkIntegration"]
    );

    console.log("All contracts deployed successfully!");
  } catch (error) {
    console.error("Error during deployment:", error);
    console.log("Deployment progress saved. You can continue from where you left off.");
  }

  console.log("Deployment summary:", deployedContracts);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });