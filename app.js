import { ethers } from 'ethers';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = JSON.parse(process.env.CONTRACT_ABI);

let provider;
let signer;
let ticketContract;

async function init() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      
      ticketContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      console.log('Initialized and connected to Ethereum blockchain.');
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      showErrorToUser(error);
    }
  } else {
    console.error('Ethereum object not found! Install MetaMask or another wallet.');
  }
}

async function buyTicket(ticketId, value) {
  try {
    const transactionResponse = await ticketContract.buyTicket(ticketId, {
      value: ethers.utils.parseEther(value.toString()),
    });
    
    await transactionResponse.wait();
    
    updateUIAfterBuy();
  } catch (error) {
    console.error('Error buying a ticket:', error);
    showErrorToUser(error);
  }
}

async function transferTicket(ticketId, toAddress) {
  try {
    const transactionResponse = await ticketContract.transferTicket(ticketId, toAddress);
    
    await transactionResponse.wait();
    
    updateUIAfterTransfer();
  } catch (error) {
    console.error('Error transferring ticket:', error);
    showErrorToUser(error);
  }
}

function updateUIAfterBuy() {
  console.log('Ticket bought successfully. Update your UI here.');
}

function updateUIAfterTransfer() {
  console.log('Ticket transferred successfully. Update your UI here.');
}

function showErrorToUser(error) {
  console.error('An error occurred:', error);
  alert(`An error occurred. Please check the console for details.\nError: ${error.message || error}`);
}

init();