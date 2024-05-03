// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract TicketingSystem is ERC721URIStorage, Ownable {
    uint256 public nextEventId;
    uint256 public nextTicketId;

    struct Event {
        uint256 id;
        string name;
        uint256 ticketPrice;
        uint256 totalTickets;
        uint256 ticketsSold;
    }

    struct ResaleTicket {
        bool isForSale;
        uint256 price;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => uint256) public ticketToEvent;
    mapping(address => mapping(uint256 => uint256)) private ownedTicketsCount;
    mapping(uint256 => ResaleTicket) public resaleTickets; // Mapping to track resale tickets

    event EventCreated(uint256 indexed eventId, string eventName, uint256 ticketPrice, uint256 totalTickets);
    event TicketPurchased(uint256 indexed eventId, uint256 ticketId, address buyer);
    event TicketTransferred(uint256 indexed ticketId, address from, address to);
    event TicketReturned(uint256 indexed eventId, uint256 ticketId, address owner);
    // Resale market events
    event TicketListedForResale(uint256 indexed ticketId, uint256 price);
    event TicketResalePurchased(uint256 indexed ticketId, uint256 price, address buyer);

    constructor() ERC721("DecentralizedTicket", "DTC") {}

    function createEvent(string memory name, uint256 ticketPrice, uint256 totalTickets) public onlyOwner {
        require(ticketPrice > 0, "Error: Ticket price must be greater than 0");
        require(totalTickets > 0, "Error: Total tickets must be greater than 0");
        uint256 eventId = nextEventId++;
        events[eventId] = Event({
            id: eventId,
            name: name,
            ticketPrice: ticketPrice,
            totalTickets: totalTickets,
            ticketsSold: 0
        });

        emit EventCreated(eventId, name, ticketPrice, totalTickets);
    }

    function buyTicket(uint256 eventId) public payable {
        require(events[eventId].id == eventId, "Error: Event does not exist");
        Event storage event_ = events[eventId];
        require(msg.value == event_.ticketPrice, "Error: Incorrect ticket price");
        require(event_.ticketsSold < event_.totalTickets, "Error: Event is sold out");

        uint256 ticketId = nextTicketId++;
        _safeMint(msg.sender, ticketId);
        _setTokenURI(ticketId, string(abi.encodePacked("https://ticketuri/", Strings.toString(ticketId))));
        ticketToEvent[ticketId] = eventId;
        event_.ticketsSold++;
        ownedTicketsCount[msg.sender][eventId]++;

        emit TicketPurchased(eventId, ticketId, msg.sender);
    }

    function listTicketForResale(uint256 ticketId, uint256 price) public {
        require(_exists(ticketId), "Error: Ticket does not exist");
        require(ownerOf(ticketId) == msg.sender, "Error: You must own the ticket to list it for resale");
        require(price > 0, "Error: Resale price must be greater than 0");

        resaleTickets[ticketId] = ResaleTicket({
            isForSale: true,
            price: price
        });

        emit TicketListedForResale(ticketId, price);
    }

    function buyResaleTicket(uint256 ticketId) public payable {
        require(resaleTickets[ticketId].isForSale, "Error: Ticket not for resale");
        ResaleTicket storage resaleTicket = resaleTickets[ticketId];
        require(msg.value == resaleTicket.price, "Error: Incorrect ticket price");

        address previousOwner = ownerOf(ticketId);
        _transfer(previousOwner, msg.sender, ticketId);
        
        (bool sent, ) = payable(previousOwner).call{value: msg.value}("");
        require(sent, "Error: Failed to send Ether to the previous owner");

        resaleTicket.isForSale = false; // Marks the ticket as sold/not available for resale anymore

        ownedTicketsCount[previousOwner][ticketToEvent[ticketId]]--;
        ownedTicketsCount[msg.sender][ticketToEvent[ticketId]]++;
        
        emit TicketResalePurchased(ticketId, msg.value, msg.sender);
    }
}