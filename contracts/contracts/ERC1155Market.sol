// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.6;

import "../node_modules/@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title NFTMarket
 * @dev NFT Marketplace Smart Contract for ownership
 * TODO Make Reselling Functionality
 */

contract ERC1155Market is ReentrancyGuard,ERC1155Holder{

    //ERC 20 Transfer
    IERC20 private mcoToken;
    IERC20 private gcoToken;

    event TransferSent(address _senderAddress, address _destAddress, uint256 _amount);

    //Marketplace Code
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsListed;

    using SafeMath for uint256;
    address owner;
    uint256 listingPrice = 0.000001 ether;
    enum ItemCategories{ART, MUSIC, COLLECTIBLE, SKILL, OTHER} 
    /*string[] collections;
    mapping(string=>uint256) collectionNameToID;*/

    constructor(IERC20 _mcoToken, IERC20 _gcoToken) {
        owner = address(msg.sender);//Tentatively change to beneficiary
        /*collections.push("Independent");
        collectionNameToID["Independent"] = 1;//collections is -1 from the id*/
        mcoToken = _mcoToken;
        gcoToken = _gcoToken;
    }
    
    function getListingPrice() public view returns (uint256) {
    return listingPrice;
  }


    struct MarketItem {
        uint itemId;//Make it a one-to-one mapping with nftContract and tokenID
        address nftContract;
        uint256 tokenId;
        uint256 currentPrice;
        ItemCategories category;
        bool listed;
        address creator;
        address currentOwner;
        uint royalty;
        bool useGco;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint royalty
    );

    event MarketItemMultiCreated (
      uint indexed itemId,
      address indexed nftContract,
      uint256 indexed tokenId,
      address seller,
      address owner,
      uint royalty,
      uint quantity
  );

    event MarketListingCreated (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address lister,
        uint256 price,
        string transactionToken
    );

    event MarketMultiListingCreated (
      uint indexed itemId,
      address indexed nftContract,
      uint256 indexed tokenId,
      address lister,
      uint256 price,
      string transactionToken,
      uint quantity
  );

    event MarketListingCancelled (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address lister,
        uint256 price,
        string transactionToken
    );


    event MarketSaleCreated (
          uint indexed itemId,
          address indexed nftContract,
          uint256 indexed tokenId,
          address seller,
          address buyer,
          uint256 price,
          uint royalty,
          string transactionToken
      );


//we waant to create a modifier to check if the caller is the item owner
    modifier onlyItemOwner (address tokenAddress, uint256 tokenId) {
        require(IERC1155(tokenAddress).balanceOf(msg.sender,tokenId) >=1 , "lister is not owner of NFT anymore" );
        _;
    }

    //modifier which checks if the item actuall does exist
    modifier itemExists(uint256 id){
        require(id <= _itemIds.current() && idToMarketItem[id].itemId == id, "could not find item");
        _;
    }

    modifier isForSale(uint256 id) {
        require(idToMarketItem[id].listed == true, "Item not currently for sale");
        _;
    }

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
function createMarketItem(address nftContract, uint256 tokenId, uint category, uint royalty) onlyItemOwner(nftContract, tokenId) public nonReentrant {
    _itemIds.increment();
    uint256 itemId = _itemIds.current();
    

    //One-to-one mapping itemId to item
    idToMarketItem[itemId] =  MarketItem(itemId, nftContract, tokenId,0,ItemCategories(category), false, address(msg.sender),address(msg.sender),royalty,true);

    
    //Log creation of Market Item
    emit MarketItemCreated(itemId,nftContract,tokenId,address(0),msg.sender,royalty);
  }


  function createMultiMarketItem(address nftContract, uint256 tokenId, uint category, uint royalty, uint quantity) onlyItemOwner(nftContract, tokenId) public nonReentrant {
    uint firstItemId = _itemIds.current();
    uint256 itemId = _itemIds.current();
    for (uint i = 0; i < quantity; i++) {
        _itemIds.increment();
        itemId = _itemIds.current();
        idToMarketItem[itemId] =  MarketItem(itemId, nftContract, tokenId,0,ItemCategories(category), false, address(msg.sender),address(msg.sender),royalty,true);
    }
    //Log creation of Market Item
    emit MarketItemMultiCreated(firstItemId+1,nftContract,tokenId,address(0),msg.sender,royalty,quantity);
  }

  /*
  Create Market Listing--
  Function: Transfers ownership of NFT to market and pay listing price
  -- Considerations: 
    - Should listing price be fixed amount or a percentage
 */

  function createMarketListing(uint256 itemId, uint256 price, bool useGco) public itemExists(itemId) nonReentrant {
    require(price > 0, "Price must be at least 1 wei");
    uint256 tokenId = idToMarketItem[itemId].tokenId;
    address nftContract = idToMarketItem[itemId].nftContract;
    require(IERC1155(nftContract).balanceOf(msg.sender,tokenId) >=1 , "only owner can list NFT" );
    // Creator transfers listing price in merchcoin and ownership to the smart contract
    gcoToken.transferFrom(address(msg.sender),address(this),listingPrice);
    if(useGco){
      idToMarketItem[itemId].useGco = true;
    }else{
      idToMarketItem[itemId].useGco = false;
    }
    //Change Current listed price
    idToMarketItem[itemId].currentPrice = price;

    //Transfer nft ownership to marketplace contract
    IERC1155(nftContract).safeTransferFrom(address(msg.sender), address(this), tokenId,1,"");

    //Change the status to listed
    idToMarketItem[itemId].listed = true;
    _itemsListed.increment();
    //Log creation of Market Listing
    if(useGco){
      emit MarketListingCreated(itemId,nftContract,tokenId,msg.sender,price,'GCO');
    }else{
      emit MarketListingCreated(itemId,nftContract,tokenId,msg.sender,price,'MCO');
    }
  }

  function createMultiMarketListing(uint256 itemId, uint256 price, bool useGco, uint quantity) public itemExists(itemId) nonReentrant {
    // Might just be for erc1155, meaning that we could either search by tokenId or make sure that its the first item id and iterate from there
    require(price > 0, "Price must be at least 1 wei");
    uint256 tokenId = idToMarketItem[itemId].tokenId;
    address nftContract = idToMarketItem[itemId].nftContract;
    require(IERC1155(nftContract).balanceOf(msg.sender,tokenId) >=quantity , "only owner can list NFT" );
    //Creator transfers listing price in merchcoin and ownership to the smart contract
    gcoToken.transferFrom(address(msg.sender),address(this),listingPrice*quantity);

    //In case the itemId passed in isn't the first one on the marketplace
    uint upperBound = itemId;
    uint lowerBound = 0;
    if(quantity<upperBound) lowerBound = itemId - quantity;
    uint mid = 0;
    uint firstItemId = itemId;
    while(lowerBound<=upperBound){
      mid = (upperBound + lowerBound)/2;
      if(idToMarketItem[mid].tokenId==tokenId){
        firstItemId = mid;
        upperBound = mid-1;
      }else lowerBound = mid+1;
    }

    uint cnt = quantity;
    while(idToMarketItem[firstItemId].tokenId == tokenId && cnt>0){
      //Only Items under msgsender ownership is listed
     if(idToMarketItem[firstItemId].currentOwner == address(msg.sender) && idToMarketItem[firstItemId].listed == false){
      if(useGco){
        idToMarketItem[firstItemId].useGco = true;
      }else{
        idToMarketItem[firstItemId].useGco = false;
      }
      //Change Current listed price
      idToMarketItem[firstItemId].currentPrice = price;  
      idToMarketItem[firstItemId].listed = true;
       //Change the status to listed
      _itemsListed.increment();
      cnt--;
     }
      firstItemId+=1;
    }
    //Transfer nft ownership to marketplace contract
    IERC1155(nftContract).safeTransferFrom(address(msg.sender), address(this), tokenId,quantity,"");

   
    //Log creation of Market Listing
    if(useGco){
      emit MarketMultiListingCreated(itemId,nftContract,tokenId,msg.sender,price,'GCO', quantity);
    }else{
      emit MarketMultiListingCreated(itemId,nftContract,tokenId,msg.sender,price,'MCO', quantity);
    }
  }

  //Cancel market listing
  function cancelMarketListing(uint256 itemId) public itemExists(itemId) isForSale(itemId) nonReentrant {
    uint256 tokenId = idToMarketItem[itemId].tokenId;
    address nftContract = idToMarketItem[itemId].nftContract;
    require(IERC1155(nftContract).balanceOf(msg.sender,tokenId) >=1 , "only owner can cancel NFT listing" );
    //Creator transfers listing price in merchcoin and ownership to the smart contract
    gcoToken.transferFrom(address(this),address(msg.sender),listingPrice);

    //Transfer nft ownership to marketplace contract
    IERC1155(nftContract).safeTransferFrom(address(this), address(msg.sender), tokenId,1,"");

    //Change the status to listed
    idToMarketItem[itemId].listed = false;
    uint256 price = idToMarketItem[itemId].currentPrice; 
    bool useGco = idToMarketItem[itemId].useGco;
    _itemsListed.decrement();
    //Log creation of Market Listing
    if(useGco){
      emit MarketListingCancelled(itemId,nftContract,tokenId,msg.sender,price,'GCO');
    }else{
      emit MarketListingCancelled(itemId,nftContract,tokenId,msg.sender,price,'MCO');
    }
  }



  /*
  Create Market Sale--
  Function: 
  When someone buys the item, 
  1) transfers item price to the seller
  2) transfers ownership to buyer,
  3) transfers listing price to the admin beneficiary
 */

   function createMarketSale(address nftContract, uint256 itemId) itemExists(itemId) isForSale(itemId) public nonReentrant {
    uint256 price = idToMarketItem[itemId].currentPrice;
    uint tokenId = idToMarketItem[itemId].tokenId;
    address lister = idToMarketItem[itemId].currentOwner;
    uint royalty = idToMarketItem[itemId].royalty;
    address creator = idToMarketItem[itemId].creator;
    bool useGco = idToMarketItem[itemId].useGco;

    //Balance
    uint256 erc20balance = gcoToken.balanceOf(address(msg.sender)); 
    if(useGco)erc20balance = gcoToken.balanceOf(address(msg.sender)); 
    else erc20balance = mcoToken.balanceOf(address(msg.sender)); 
    
    require(erc20balance >= price, "Insufficient funds to complete the purchase");

    if (price > 0) {
      uint256 fee = (price.div(10000)).mul(250);
      uint creatorRoyalty = (price-fee).mul(royalty).div(100);
      
      if(useGco){
        gcoToken.transferFrom(address(msg.sender), address(this), price);

        // Contract pays seller
        gcoToken.transfer(address(creator), creatorRoyalty);
        gcoToken.transfer(address(lister), price - fee - creatorRoyalty);
      }else{
          // Buyer pays contract
        mcoToken.transferFrom(address(msg.sender), address(this), price);

        // Contract pays seller
        mcoToken.transfer(address(creator), creatorRoyalty);
        mcoToken.transfer(address(lister), price - fee - creatorRoyalty);
      }
      
    }

    // Transfer ownership from contract to buyer
    IERC1155(nftContract).safeTransferFrom(address(this), address(msg.sender), tokenId, 1, "");

    // Increase the sale index for the saleHistory array of the item
    idToMarketItem[itemId].listed = false;
    idToMarketItem[itemId].currentOwner = address(msg.sender);
    _itemsListed.decrement();

    if(useGco){
      emit MarketSaleCreated(itemId, nftContract, tokenId, lister, msg.sender, price, royalty,'GCO');
    }else{
      emit MarketSaleCreated(itemId, nftContract, tokenId, lister, msg.sender, price, royalty,'MCO');
    }
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