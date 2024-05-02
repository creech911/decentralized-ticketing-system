require('dotenv').config();
const ethers = require('ethers');

const smartContractAddress = process.env.CONTRACT_ADDRESS;
const smartContractABI = JSON.parse(process.env.CONTRACT_ABI);
const userPrivateKey = process.env.PRIVATE_KEY;
const blockchainProviderURL = process.env.PROVIDER_URL;

const blockchainProvider = new ethers.providers.JsonRpcProvider(blockchainProviderURL);
const userWallet = new ethers.Wallet(userPrivateKey, blockchainProvider);
const ticketingContract = new ethers.Contract(smartContractAddress, smartContractABI, userWallet);

async function purchaseTicket(ticketId, paymentAmount) {
    try {
        const transaction = await ticketingContract.buyTicket(ticketId, { value: paymentAmount });
        await transaction.wait();
        showSuccessMessage('Ticket purchased successfully!');
        refreshUIAfterPurchase(ticketId);
    } catch (error) {
        processEthersError(error);
    }
}

async function sendTicket(ticketId, recipientAddress) {
    try {
        const transaction = await ticketingContract.transferTicket(recipientAddress, ticketId);
        await transaction.wait();
        showSuccessMessage('Ticket transferred successfully!');
        refreshUIAfterTransfer(ticketId, recipientAddress);
    } catch (error) {
        processEthersError(error);
    }
}

function processEthersError(error) {
    if (error.code === 'NETWORK_ERROR') {
        showError('A network error occurred, please check your connection.');
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
        showError('Insufficient funds for transaction.');
    } else if (error.code === 'CALL_EXCEPTION') {
        showError('A call exception occurred, possibly wrong arguments or gas settings.');
    } else {
        // Log the error object for debugging purposes
        console.error(error);
        showError('Failed to execute the operation. Please try again.');
    }
}

function refreshUIAfterPurchase(ticketId) {
    console.log(`UI refreshed for purchased ticket ID: ${ticketId}`);
}

function refreshUIAfterTransfer(ticketId, recipientAddress) {
    console.log(`UI refreshed for transferred ticket ID: ${ticketId} to address: ${recipientAddress}`);
}

function showSuccessMessage(message) {
    console.log(`Success: ${message}`);
}

function showError(message) {
    console.log(`Error: ${message}`);
}

ticketingContract.on('TicketPurchased', (buyer, ticketId) => {
    console.log(`New ticket purchased by ${buyer} with ID: ${ticketId}`);
});

ticketingContract.on('TicketTransferred', (sender, receiver, ticketId) => {
    console.log(`Ticket ID: ${ticketId} transferred from ${sender} to ${receiver}`);
});