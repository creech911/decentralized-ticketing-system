const hre = require("hardhat");
require("dotenv").config();

async function main() {
  await hre.run('compile');
  
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  
  const balanceBefore = await deployer.getBalance();
  
  const TicketingSystem = await hre.ethers.getContractFactory("TicketingSystem");
  const ticketingSystem = await TicketingSystem.deploy();
  
  await ticketingSystem.deployed();
  console.log("TicketingSystem deployed to:", ticketingSystem.address);
  
  const balanceAfter = await deployer.getBalance();
  
  console.log("Deployment cost:", balanceBefore.sub(balanceAfter).toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });