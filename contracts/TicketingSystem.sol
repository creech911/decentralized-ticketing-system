pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketingSystem is ERC721URIStorage, Ownable {
    uint256 public nextEventId;
    uint256 public nextTicketId;

    struct Event {
        uint256 id;
        string name;
        uint256 ticketPrice;
        uint256 totalTickets;
        uint256 ticketsSold;
        address organizer;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => uint256) public ticketToEvent;
    mapping(address => mapping(uint256 => uint256)) private ownedTicketsCount;

    event EventCreated(uint256 indexed eventId, string eventName, uint256 ticketPrice, uint256 totalTickets, address organizer);
    event TicketPurchased(uint256 indexed eventId, uint256 ticketId, address buyer);
    event TicketTransferred(uint256 indexed ticketId, address from, address to);
    event TicketReturned(uint256 indexed eventId, uint256 ticketId, address owner);

    constructor() ERC721("DecentralizedTicket", "DTC") {}

    function createEvent(string memory name, uint256 ticketPrice, uint256 totalTickets) public onlyOwner {
        uint256 eventId = nextEventId++;
        events[eventId] = Event({
            id: eventId,
            name: name,
            ticketPrice: ticketPrice,
            totalTickets: totalTickets,
            ticketsSold: 0,
            organizer: msg.sender
        });

        emit EventCreated(eventId, name, ticketPrice, totalTickets, msg.sender);
    }

    function buyTicket(uint256 eventId) public payable {
        Event storage event_ = events[eventId];
        require(msg.value == event_.ticketPrice, "Incorrect ticket price");
        require(event_.ticketsSold < event_.totalTickets, "Event is sold out");

        uint256 ticketId = nextTicketId++;
        _safeMint(msg.sender, ticketId);
        _setTokenURI(ticketId, string(abi.encodePacked("https://ticketuri/", Strings.toString(ticketId))));
        ticketToEvent[ticketId] = eventId;
        event_.ticketsSold++;
        ownedTicketsCount[msg.sender][eventId]++;

        emit TicketPurchased(eventId, ticketId, msg.sender);
    }

    function transferTicket(uint256 ticketId, address to) public {
        require(ownerOf(ticketId) == msg.sender, "You must own the ticket to transfer it");
        safeTransferFrom(msg.sender, to, ticketId);

        uint256 eventId = ticketToEvent[ticketId];
        ownedTicketsCount[msg.sender][eventId]--;
        ownedTicketsCount[to][eventId]++;

        emit TicketTransferred(ticketId, msg.sender, to);
    }

    function returnTicket(uint256 ticketId) public {
        require(ownerOf(ticketId) == msg.sender, "You must own the ticket to return it");
        uint256 eventId = ticketToEvent[ticketId];
        Event storage event_ = events[eventId];
        require(block.timestamp < event_.eventDate, "Cannot return ticket after event start");

        _burn(ticketId);
        ownedTicketsCount[msg.sender][eventId]--;
        event_.ticketsSold--;
        payable(msg.sender).transfer(event_.ticketPrice);

        emit TicketReturned(eventId, ticketId, msg.sender);
    }

    function getOwnedTicketsCount(address owner, uint256 eventId) public view returns (uint256) {
        return ownedTicketsCount[owner][eventId];
    }
}