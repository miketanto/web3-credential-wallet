// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


/**
 * @title NFTMarket
 * @dev NFT Marketplace Smart Contract for ownership
 * TODO Make Reselling Functionality
 */

contract NFTMarket is ReentrancyGuard{

    //ERC 20 Transfer
    IERC20 private mcoToken;
    IERC20 private gcoToken;

    event TransferSent(address _senderAddress, address _destAddress, uint256 _amount);

    //Marketplace Code
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsListed;

    address owner;
    uint256 listingPrice = 0.025 ether;
    enum ItemCategories{ART, MUSIC, COLLECTIBLE, SKILL, OTHER} 
    /*string[] collections;
    mapping(string=>uint256) collectionNameToID;*/

    constructor(IERC20 _mcoToken, IERC20 _gcoToken) public {
        owner = address(msg.sender);//Tentatively change to beneficiary
        /*collections.push("Independent");
        collectionNameToID["Independent"] = 1;//collections is -1 from the id*/
        mcoToken = _mcoToken;
        gcoToken = _gcoToken;
    }
    
    function getListingPrice() public view returns (uint256) {
    return listingPrice;
  }

      struct MarketSale{
      address seller;
      address owner;
      uint256 price;
    }

    struct MarketItem {
        uint itemId;//Make it a one-to-one mapping with nftContract and tokenID
        address nftContract;
        uint256 tokenId;
        uint256 currentPrice;
        uint256 saleIndex;
        ItemCategories category;
        bool listed;
        address creator;
        address currentOwner;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;
    mapping(uint256 => MarketSale[]) private idToSaleHistory;

    event MarketItemCreated (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner
    );

    event MarketListingCreated (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address lister,
        uint256 price
    );

    /* Places an item for sale on the marketplace */
  /*function getCollectionId(string collectionName) public view returns(uint256){
    return (collectionNameToID[collectionName]);
  }*/

/*
  Create Market Item--
  Function: Creates new NFT struct and makes 1-1 mapping to an itemId in the market;
  -- Considerations: 
    - Keep it like this where every single minted nft in blockchain is a struct item in contract too
    - Only enter the market contract once want to bring up for listing?-- Downside, need to interface with respective nft contracts
 */
function createMarketItem(address nftContract, uint256 tokenId, uint category) public nonReentrant {
    _itemIds.increment();
    uint256 itemId = _itemIds.current();
    
    idToSaleHistory[itemId].push(MarketSale(address(0),address(msg.sender),0));

    //One-to-one mapping itemId to item
    idToMarketItem[itemId] =  MarketItem(itemId, nftContract, tokenId,0,0,ItemCategories(category), false, address(msg.sender),address(msg.sender));

    
    //Log creation of Market Item
    emit MarketItemCreated(itemId,nftContract,tokenId,address(0),msg.sender);
  }

  /*
  Create Market Listing--
  Function: Transfers ownership of NFT to market and pay listing price
  -- Considerations: 
    - Should listing price be fixed amount or a percentage
 */

  function createMarketListing(uint256 itemId, uint256 price) public nonReentrant {
    require(price > 0, "Price must be at least 1 wei");
    uint256 tokenId = idToMarketItem[itemId].tokenId;
    address nftContract = idToMarketItem[itemId].nftContract;
    //Creator transfers listing price in merchcoin and ownership to the smart contract
    gcoToken.transferFrom(address(msg.sender),address(this),listingPrice);

    //Change Current listed price
    idToMarketItem[itemId].currentPrice = price;

    //Transfer nft ownership to marketplace contract
    IERC721(nftContract).transferFrom(address(msg.sender), address(this), tokenId);

    //Change the status to listed
    idToMarketItem[itemId].listed = true;
    _itemsListed.increment();
    //Log creation of Market Listing
    emit MarketListingCreated(itemId,nftContract,tokenId,msg.sender,price);
  }

//Cancel market listing
  /*
  Create Market Sale--
  Function: 
  When someone buys the item, 
  1) transfers item price to the seller
  2) transfers ownership to buyer,
  3) transfers listing price to the admin beneficiary
 */

   function createMarketSale(address nftContract, uint256 itemId) public nonReentrant {

    uint256 price = idToMarketItem[itemId].currentPrice;
    uint tokenId = idToMarketItem[itemId].tokenId;
    uint saleIndex = idToMarketItem[itemId].saleIndex;
    address lister = idToSaleHistory[itemId][saleIndex].owner;

    uint256 erc20balance = gcoToken.balanceOf(address(msg.sender)); 
    require(erc20balance >= price, "Insufficient MerchCoin funds to complete the purchase");
    require(IERC721(nftContract).ownerOf(tokenId) == lister, "lister is not owner of NFT anymore" );

    //
    gcoToken.transferFrom(address(msg.sender),address(lister),price);

    //Transfer ownership to the buyer
    IERC721(nftContract).transferFrom(address(this), address(msg.sender), tokenId);

    MarketSale memory sale = MarketSale(lister,address(msg.sender),price);

    //Increase the sale index for the saleHistory array of the item
    idToSaleHistory[itemId].push(sale);
    idToMarketItem[itemId].saleIndex += 1; 
    idToMarketItem[itemId].listed = false;
    idToMarketItem[itemId].currentOwner = address(msg.sender);
    _itemsListed.decrement();

    //Transfer listing price to beneficiary
    gcoToken.approve(address(this),listingPrice);
    gcoToken.transferFrom(address(this),owner,listingPrice);
    //MarketTransactionEVENT
  }

  /* 
  Returns all market items 
  --Classification of listed and unlisted will be handled in frontend
  */
  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint itemCount = _itemIds.current();
    uint currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < itemCount; i++) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
    }
    return items;
  }

  /* 
  fetchMyNFTs
  -- Returns only items that a user has purchased 
  */
  function fetchMyNFTs() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].currentOwner == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].currentOwner == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }


  /* Returns items a user has created */
  function fetchItemsCreated() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].creator == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].creator == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

}