require('dotenv').config();
const ethers = require('ethers');

const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = JSON.parse(process.env.CONTRACT_ABI);
const userWalletPrivateKey = process.env.PRIVATE_KEY;
const providerURL = process.env.PROVIDER_URL;

const blockchainProvider = new ethers.providers.JsonRpcProvider(providerURL);
const walletWithProvider = new ethers.Wallet(userWalletPrivateKey, blockchainProvider);
const ticketContractInstance = new ethers.Contract(contractAddress, contractABI, walletWithProvider);

async function buyTicketByIdAndAmount(ticketId, paymentAmount) {
    try {
        const tx = await ticketContractInstance.buyTicket(ticketId, { value: paymentAmount });
        await tx.wait();
        displaySuccess('Ticket purchased successfully!');
        updateUIAfterTicketPurchase(ticketId);
    } catch (error) {
        handleTransactionError(error);
    }
}

async function transferTicketToRecipient(ticketId, recipientWalletAddress) {
    try {
        const tx = await ticketContractInstance.transferTicket(recipientWalletAddress, ticketId);
        await tx.wait();
        displaySuccess('Ticket transferred successfully!');
        updateUIAfterTicketTransfer(ticketId, recipientWalletAddress);
    } catch (error) {
        handleTransactionError(error);
    }
}

function handleTransactionError(error) {
    if (error.code === 'NETWORK_ERROR') {
        displayError('A network error occurred, please check your connection.');
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
        displayError('Insufficient funds for transaction.');
    } else if (error.code === 'CALL_EXCEPTION') {
        displayError('A call exception occurred, possibly wrong arguments or gas settings.');
    } else {
        // Log the error object for debugging purposes
        console.error(error);
        displayError('Failed to execute the operation. Please try again.');
    }
}

function updateUIAfterTicketPurchase(ticketId) {
    console.log(`UI updated for purchased ticket ID: ${ticketId}`);
}

function updateUIAfterTicketTransfer(ticketId, recipientAddress) {
    console.log(`UI updated for transferred ticket ID: ${ticketId} to address: ${recipientAddress}`);
}

function displaySuccess(message) {
    console.log(`Success: ${message}`);
}

function displayError(message) {
    console.log(`Error: ${message}`);
}

ticketContractInstance.on('TicketPurchased', (buyer, ticketId) => {
    console.log(`New ticket purchased by ${buyer} with ID: ${ticketId}`);
});

ticketContractInstance.on('TicketTransferred', (sender, receiver, ticketId) => {
    console.log(`Ticket ID: ${ticketId} transferred from ${sender} to ${receiver}`);
});