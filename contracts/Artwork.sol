// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Artwork is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct ArtworkDetails {
        address artist;
        uint256 royaltyPercentage;
        uint256 price;
        bool isForSale;
    }

    mapping(uint256 => ArtworkDetails) public artworks;

    event ArtworkCreated(uint256 indexed tokenId, address indexed artist, string tokenURI);
    event ArtworkPriceUpdated(uint256 indexed tokenId, uint256 newPrice);
    event ArtworkSold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);

    constructor() ERC721("CoreArtwork", "CART") {}

    function createArtwork(string memory tokenURI, uint256 _royaltyPercentage, uint256 _price) public nonReentrant returns (uint256) {
        require(_royaltyPercentage <= 100, "Royalty percentage must be between 0 and 100");

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        artworks[newItemId] = ArtworkDetails(msg.sender, _royaltyPercentage, _price, true);

        emit ArtworkCreated(newItemId, msg.sender, tokenURI);
        return newItemId;
    }

    function updateArtworkPrice(uint256 tokenId, uint256 newPrice) public {
        require(_exists(tokenId), "Artwork does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");

        artworks[tokenId].price = newPrice;
        emit ArtworkPriceUpdated(tokenId, newPrice);
    }

    function buyArtwork(uint256 tokenId) public payable nonReentrant {
        require(_exists(tokenId), "Artwork does not exist");
        require(artworks[tokenId].isForSale, "Artwork is not for sale");
        require(msg.value >= artworks[tokenId].price, "Insufficient payment");

        address seller = ownerOf(tokenId);
        uint256 price = artworks[tokenId].price;
        uint256 royalty = (price * artworks[tokenId].royaltyPercentage) / 100;

        _transfer(seller, msg.sender, tokenId);

        // Pay royalty to the original artist
        payable(artworks[tokenId].artist).transfer(royalty);

        // Transfer the remaining amount to the seller
        payable(seller).transfer(price - royalty);

        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }

        artworks[tokenId].isForSale = false;
        emit ArtworkSold(tokenId, seller, msg.sender, price);
    }

    function toggleSaleStatus(uint256 tokenId) public {
        require(_exists(tokenId), "Artwork does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");

        artworks[tokenId].isForSale = !artworks[tokenId].isForSale;
    }
}