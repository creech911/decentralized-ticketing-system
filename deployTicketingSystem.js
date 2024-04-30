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
  
  // Simulating a ticket cancellation (Ensure your Smart Contract has this functionality)
  console.log("Attempting to cancel a ticket...");
  // Placeholder for ticket cancellation. Adapt according to your contract's cancelTicket function.
  // This is a mocked-up example assuming the cancelTicket function takes a ticketId.
  const ticketId = 1; // Example ticket ID, replace with dynamic data as necessary
  const cancelTx = await ticketingSystem.cancelTicket(ticketId);
  await cancelTx.wait(); // Wait for the transaction to be mined
  console.log(`Ticket with ID ${ticketId} cancelled.`);
  
  const balanceAfter = await deployer.getBalance();
  
  console.log("Deployment cost:", balanceBefore.sub(balanceAfter).toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });