// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Marketplace is Ownable, ReentrancyGuard {
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool isActive;
    }

    struct Offer {
        address buyer;
        uint256 price;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer[]) public offers;
    uint256 public listingCounter;
    uint256 public platformFee;
    IERC20 public coreToken;

    event Listed(uint256 indexed listingId, address indexed seller, address indexed nftContract, uint256 tokenId, uint256 price);
    event Sale(uint256 indexed listingId, address buyer, uint256 price);
    event ListingCancelled(uint256 indexed listingId);
    event OfferMade(uint256 indexed listingId, address indexed buyer, uint256 price);
    event OfferAccepted(uint256 indexed listingId, address indexed buyer, uint256 price);

    constructor(address _coreToken, uint256 _platformFee) {
        coreToken = IERC20(_coreToken);
        platformFee = _platformFee;
    }

    function listItem(address _nftContract, uint256 _tokenId, uint256 _price) external nonReentrant {
        IERC721 nftContract = IERC721(_nftContract);
        require(nftContract.ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(nftContract.isApprovedForAll(msg.sender, address(this)), "Contract not approved");

        listingCounter++;
        listings[listingCounter] = Listing(msg.sender, _nftContract, _tokenId, _price, true);

        emit Listed(listingCounter, msg.sender, _nftContract, _tokenId, _price);
    }

    function buyItem(uint256 _listingId) external nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.isActive, "Listing not active");

        uint256 totalPrice = listing.price;
        uint256 fee = (totalPrice * platformFee) / 10000;
        uint256 sellerAmount = totalPrice - fee;

        require(coreToken.transferFrom(msg.sender, address(this), totalPrice), "Transfer failed");
        require(coreToken.transfer(listing.seller, sellerAmount), "Seller payment failed");
        require(coreToken.transfer(owner(), fee), "Fee payment failed");

        IERC721(listing.nftContract).safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

        listing.isActive = false;
        emit Sale(_listingId, msg.sender, totalPrice);
    }

    function cancelListing(uint256 _listingId) external nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Listing not active");

        listing.isActive = false;
        emit ListingCancelled(_listingId);
    }

    function makeOffer(uint256 _listingId, uint256 _offerPrice) external nonReentrant {
        require(listings[_listingId].isActive, "Listing not active");
        require(_offerPrice > 0, "Offer must be greater than 0");

        offers[_listingId].push(Offer(msg.sender, _offerPrice));
        emit OfferMade(_listingId, msg.sender, _offerPrice);
    }

    function acceptOffer(uint256 _listingId, uint256 _offerIndex) external nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Listing not active");

        Offer memory offer = offers[_listingId][_offerIndex];
        uint256 fee = (offer.price * platformFee) / 10000;
        uint256 sellerAmount = offer.price - fee;

        require(coreToken.transferFrom(offer.buyer, address(this), offer.price), "Transfer failed");
        require(coreToken.transfer(listing.seller, sellerAmount), "Seller payment failed");
        require(coreToken.transfer(owner(), fee), "Fee payment failed");

        IERC721(listing.nftContract).safeTransferFrom(listing.seller, offer.buyer, listing.tokenId);

        listing.isActive = false;
        emit OfferAccepted(_listingId, offer.buyer, offer.price);
    }

    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = _newFee;
    }
}