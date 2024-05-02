const hre = require("hardhat");
require("dotenv").config();

async function main() {
    await hre.run('compile');
    
    const [deployer] = await hre.ethers.getSigners();
    
    console.log("Deploying contracts with the account:", deployer.address);
    
    let balanceBefore;
    try {
        balanceBefore = await deployer.getBalance();
    } catch (error) {
        console.error("Failed to get deployer's balance:", error);
        process.exit(1); // Exit if we cannot even fetch the deployer's balance
    }
    
    let ticketingSystem;
    try {
        const TicketingSystem = await hre.ethers.getContractFactory("TicketingSystem");
        ticketingSystem = await TicketingSystem.deploy();
        await ticketingSystem.deployed();
        console.log("TicketingSystem deployed to:", ticketingSystem.address);
    } catch (error) {
        console.error("Failed to deploy TicketingSystem:", error);
        process.exit(1); // Consider the deployment a critical failure
    }
    
    console.log("Attempting to cancel a ticket...");
    const ticketId = 1; // Example ticket ID, replace with dynamic data as necessary
    
    try {
        const cancelTx = await ticketingSystem.cancelTicket(ticketId);
        await cancelTx.wait(); // Wait for the transaction to be mined
        console.log(`Ticket with ID ${ticketId} cancelled.`);
    } catch (error) {
        console.error(`Failed to cancel ticket with ID ${ticketId}:`, error);
    }
    
    let balanceAfter;
    try {
        balanceAfter = await deployer.getBalance();
    } catch (error) {
        console.error("Failed to get deployer's balance after transactions:", error);
        return; // Exit from `main` but not the process, as it's not a critical failure at this point
    }
    
    console.log("Deployment cost:", balanceBefore.sub(balanceAfter).toString());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("An unexpected error occurred:", error);
        process.exit(1);
    });