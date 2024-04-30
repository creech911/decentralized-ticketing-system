require('dotenv').config();
const ethers = require('ethers');

const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = JSON.parse(process.env.CONTRACT_ABI);
const privateKey = process.env.PRIVATE_KEY;
const providerUrl = process.env.PROVIDER_URL;

const provider = new ethers.providers.JsonRpcProvider(providerUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const ticketContract = new ethers.Contract(contractAddress, contractABI, wallet);

async function buyTicket(ticketId, value) {
    try {
        const tx = await ticketContract.buyTicket(ticketId, { value });
        await tx.wait();
        displaySuccessMessage('Ticket purchased successfully!');
        updateUIAfterPurchase(ticketId);
    } catch (error) {
        console.error(error);
        displayErrorMessage('Failed to purchase the ticket. Please try again.');
    }
}

async function transferTicket(ticketId, toAddress) {
    try {
        const tx = await ticketContract.transferTicket(toAddress, ticketId);
        await tx.wait();
        displaySuccessMessage('Ticket transferred successfully!');
        updateUIAfterTransfer(ticketId, toAddress);
    } catch (error) {
        console.error(error);
        displayErrorMessage('Failed to transfer the ticket. Please try again.');
    }
}

function updateUIAfterPurchase(ticketId) {
    console.log(`UI updated for purchased ticket ID: ${ticketId}`);
}

function updateUIAfterTransfer(ticketId, toAddress) {
    console.log(`UI updated for transferred ticket ID: ${ticketId} to address: ${toAddress}`);
}

function displaySuccessMessage(message) {
    console.log(`Success: ${message}`);
}

function displayErrorMessage(message) {
    console.log(`Error: ${message}`);
}

ticketContract.on('TicketPurchased', (buyer, ticketId) => {
    console.log(`New ticket purchased by ${buyer} with ID: ${ticketId}`);
});

ticketContract.on('TicketTransferred', (from, to, ticketId) => {
    console.log(`Ticket ID: ${ticketId} transferred from ${from} to ${to}`);
});