/*
    TODO:
        - fix this error: "Copying nested calldata dynamic arrays to storage is not implemented in the old code generator"
        - DONE: get rid of the studentID OR blocktime stuff and just map student ids to a list of uints that are BigOrderIds, use the bigOrderId to access BigOrder directly
        - DONE: create LowInventory Event 
        - DONE: monitor inventory levels and emit LowInventory event whenever necessary
        - DONE: creating 3 user groups (admin (diff from GiesCoin admin), profs, students) with correct permissions
        - DONE: modifier based on above groups^
        - DONE: how to track which warehouse inventory is located in within the item data structure (2d arrays!!)
        - create WarehouseOrder event (to pass order details to UPS, FedEx, etc when a student successfully orders)
            - semidone, not sure if we can just emit a bigOrder datatype, might have to deconstruct:
            - we'll figure out in frontend which location to ship from, so we need some safe way for only our 
                server script to update the contract back with which location things were actually sent from and
                DONE: only then to subtract the inventory
                DONE: need to change a lot in createBigOrder as a result - bigOrder shouldn't change inventory itself now
        - DONE: which addy should we send the coins to when students paid - DLab global var
        - DONE: update updateItemDetails function to accept as input which warehouse this item resides at
        - DONE: separate MerchCoin ERC20 contract
        - DONE: remove all interaction with GiesCoin
        - Add error messages in require statements

        required server scripts (in Python using web3.py):
        1. Order inventory from MarComm when it is low (and send to correct location)
            listen for event LowInventory
            send email to MarComm with required information to place order
                check with Jake if Univ has email automation API/service
        2. Pass a student's order into shipper fulfillment software
            listen for event WarehouseOrder (see BigOrder struct for data details)
            Determine which location we should be taking inventory from (talk to Jake about how to decide)
            Pass correct order details into the shipping provider software
*/


// Marketplace
// Contract to handle marketplace

pragma solidity ^0.8.6;
// SPDX-License-Identifier: UNLICENSED

import "./Libraries.sol";
import "./Ownership.sol";

contract Marketplace is Ownable { 
    // Used to check permissions
    using Accessibility for address;
    using UtilFunctions for bytes32;

    // enum Size {XXS, XS, S, M, L, XL, XXL, XXXL}
    enum Size {XS, S, M, L, XL}         // to keep the data more slim
    uint8 constant size_size = 5;                // state var for the above
    enum Statuses {Ordered, Prepared, Shipped, Delivered}

    bytes32[] public locations;

    function getLocations() public view returns (bytes32[] memory){
        return locations;
    }

    uint256 public testInt = 20;
    bytes32 public testBytes32 = bytes32("original Test");
    string[] public testStringArray = ["many"];
    uint256[][size_size] testNestedArray = [[0],[0],[0],[0],[0]];
    function getTestNestedArray () public view returns (uint256[][size_size] memory){
        return testNestedArray;
    }
    
    function testSimpleWrite(uint256 _newInt, bytes32 _newBytes32, string[] calldata _newStringArray, uint256[][size_size] calldata _newNestedArray) public {
        testInt = _newInt;
        testBytes32 = _newBytes32;
        for (uint i = 0; i<_newStringArray.length; i++){
            testStringArray[i] = _newStringArray[i];
        }
        for (uint i = 0; i<_newNestedArray.length; i++){
            for (uint j = 0; j<_newNestedArray[i].length; j++){
                testNestedArray[i][j] = _newNestedArray[i][j];
            }
        }
    }


    function addLocation (bytes32 _new_location) public onlyMerchAdmin {
        locations.push(_new_location);
        // go through every size in every item, set inventory for new location as 0
        // expensive!!
        for (uint temp_itemId = 0; temp_itemId < next_item_id; ++temp_itemId){
            Item storage item = item_ids_to_items[temp_itemId];
            for (uint i = 0; i<size_size; ++i){
                item.quant_by_size_and_location[i].push(0);
            }
        } 
    }    
     
    function deleteLocation (uint256 _location_id) public onlyMerchAdmin {
        
        // set location to string "Deleted" in hex (bytes32)
        locations[_location_id] = bytes32("Deleted");

        // go through every size in every item and set inventory for this location to 0
        // expensive!!
        for (uint temp_itemId = 0; temp_itemId < next_item_id; ++temp_itemId){
            Item storage item = item_ids_to_items[temp_itemId];
            for (uint i = 0; i < size_size; ++i){
                item.quant_by_size_and_location[i][_location_id] = 0;
            }
        } 
    }

    function changeLocationPhrase (bytes32 _new_phrase, uint8 _location_id) public onlyMerchAdmin {
        require((_location_id < locations.length) && (_location_id>=0),"invalid location id");    // range check the _location_id
        locations[_location_id] = _new_phrase;                                  // reset location bytes32
    }

    address merchCoin;                      // address for the MerchCoin ERC20 token
    function setMerchCoinAddress (address _new_address) public onlyMerchAdmin {
        merchCoin = _new_address;
    }

    address DLab;           // Disruption Lab's address, for transfering Gies Coin post-purchase
                // this same address should be used for any backend scripts

   
    enum Users {student, prof, merchAdmin}

    function getUserType (address _address) public returns (uint256) {

        // talk to MerchCoin ERC20 contract
        bytes memory payload = abi.encodeWithSignature("getUserType(address)", _address);
        (bool success, bytes memory returnData) = address(merchCoin).call(payload);
        return uint256(bytes32(returnData));
    }

    modifier onlyMerchAdmin () {
        require(getUserType(msg.sender) == 2, "must be MerchAdmin");
        _;
    }


    address adminContractAddress;      // the actual base admin contract address


    uint8 public low_inventory_limit;       // defining the safe stock level
    uint8 public reorder_amount;            // amount to order after dropping below safe stock level

    function setLowInventoryLimit(uint8 _new_limit) public onlyMerchAdmin {
        require(_new_limit>0,"invalid new limit - must be positive");
        low_inventory_limit = _new_limit;
    }
 
    function setReorderAmount(uint8 _new_amount) public onlyMerchAdmin  {
        require(_new_amount>0 , "New reorder amount should be positive" );
        reorder_amount = _new_amount;
    }

    event LowInventory(uint256 item_id, uint256 inventory_level, uint8 location, uint256 reorder_amount);
    event WarehouseOrder(bigOrder order);



    // data structures for order details
    mapping(uint256 => Item) public item_ids_to_items;
    uint256 public next_item_id;

    // multiple mappings to handle nested orders bc solidity ...oof
    mapping (bytes32 => uint256 []) netId_to_bigOrderIds;
    mapping(uint256 => bigOrder) bigOrderId_to_bigOrder;
    mapping(uint256 => itemOrder) public itemOrderId_to_itemOrder; // was private
    mapping(address => uint256) public address_to_running_cost; // was private
    mapping(address => uint256 []) public running_address_to_itemOrderIds;  // was private
    // uint256 private latest_order_id = 0;
    
    uint256 public next_itemOrder_id = 0;
    uint256 public next_bigOrder_id = 0; 
    
    
    /// BEGIN GETTERS FOR TESTING PURPOSES - INCOMPLETE (TODO) to remove before deploying
    
    function getItemFromId(uint256 _item_id) public view returns (Item memory){
        return item_ids_to_items[_item_id];
    }
    
    function getBigOrderIdsFromNetId(bytes32 _net_id) public view returns (uint256[] memory){
        return netId_to_bigOrderIds[_net_id];
    }
    
    function getBigOrderFromBigOrderId(uint256 _big_order_id) public view returns (bigOrder memory){
        return bigOrderId_to_bigOrder[_big_order_id];
    }
    
    function getItemOrderFromItemOrderId(uint256 _itemOrderId) public view returns (itemOrder memory) {
        return itemOrderId_to_itemOrder[_itemOrderId];
    }
    
    function getItemOrderIdsFromRunningAddress(address _address) public view returns (uint256 [] memory) {
        return running_address_to_itemOrderIds[_address];
    }
    
    function getRunningCostFromAddress(address _address) public view returns (uint256){
        return address_to_running_cost[_address];
    }
        
    
    
    constructor (
        address _merchCoinAddress,
        address _adminContract,
        address _DLab
    ) {
        merchCoin = _merchCoinAddress;      // address of MerchCoin ERC20 variant
        DLab = _DLab;                       // address of Disruption Lab's account, immutable post deploy
        adminContractAddress = _adminContract; // address of base Admin contract for entire system
        low_inventory_limit = 20;           // arbitrary values for initialization, can be modded
        reorder_amount = 100;               // arbitrary values for initialization, can be modded
        locations.push(bytes32("Original Location"));
    }


    // should also figure out some way to add this contract as an approved spender for every student when they login?
    // INCOMPLETE - but lk idek if this is necessary - we can j use tx.origin and get away with it??

    // Struct to store each item
    struct Item {
        bytes32 name;
        uint256 price;
        string [] urls;             // urls to images of the item
        uint256 [][size_size] quant_by_size_and_location;    // 2d array, first dimension is the size (indez is value in Sizes enum),
                                                    // second dimension is the location, using index in locations[]
    }

    
    struct itemOrder{
        uint256 item_id;
        address student_chain_address;
        uint256[size_size] item_quantities_ordered_by_size;      // the index in this array is the size (by Sizes enum)
        uint256 item_tokens_paid;
    }

    struct bigOrder {
        uint256 tokens_paid;
        address student_chain_address;
        uint256[] itemOrderIds;
        bool picking_up_in_person;
        string shipping_address;
        uint256 time_ordered;
        Statuses current_status;
    }
    
    function createItem (
        bytes32 _name,
        uint256 _price,
        string[] calldata _urls,
        uint256[][size_size] calldata _stock_by_size_and_location        // first dimension is location
    ) public onlyMerchAdmin {

        item_ids_to_items[next_item_id] = Item(
            _name,
            _price,
            _urls,
            _stock_by_size_and_location
        );
        next_item_id++;
    }

    function updateStatus (
        uint256 _big_order_id, 
        Statuses _new_status
    ) 
        public onlyMerchAdmin 
    {
        bigOrderId_to_bigOrder[_big_order_id].current_status = _new_status;
    }
    

    function updateItemDetails (
        uint256 _item_id,
        bytes32 _new_name,
        uint256 _new_price,
        string[] calldata _new_urls,
        uint256[][size_size] calldata _new_stocks_by_sizes_and_location
        ) public onlyMerchAdmin
    {
        if ((_new_name!=bytes32(0x0)) && (item_ids_to_items[_item_id].name != _new_name)){
            item_ids_to_items[_item_id].name = _new_name;
        }
        if ((_new_price!=uint256(0)) && (item_ids_to_items[_item_id].price != _new_price)){
            item_ids_to_items[_item_id].price = _new_price;
        }
        if (_new_urls.length != 0) {
            delete item_ids_to_items[_item_id].urls;

            for (uint i = 0; i < _new_urls.length; ++i) {
                item_ids_to_items[_item_id].urls.push(_new_urls[i]);
            }
        }
        
        if (_new_stocks_by_sizes_and_location.length != 0){
            delete item_ids_to_items[_item_id].quant_by_size_and_location;

            for (uint i = 0; i < size_size; ++i) {
                item_ids_to_items[_item_id].quant_by_size_and_location[i] = _new_stocks_by_sizes_and_location[i];
            }

        }
        
    }

    function netIdToBigOrderIds (bytes32 _netId) public returns (uint256[] memory) {
        require( adminContractAddress.isAdmin(msg.sender) || adminContractAddress.addressToStudentId(msg.sender) == _netId);
        return netId_to_bigOrderIds[_netId];
    }

    function BigOrderIdToBigOrder (uint256 _big_order_id) public view returns (bigOrder memory) {
        return bigOrderId_to_bigOrder[_big_order_id];
    }

    function itemOrderIdToItemOrder(uint256 _itemOrderId) public view returns (itemOrder memory) {
        return itemOrderId_to_itemOrder[_itemOrderId];
    }
    

    // frontend can optionally check this, but we need to do it anyway within purchase in case someone bad tries buying
    function canAfford (address _buyer, uint256 _total_cost) internal returns (bool) { 
        // talk to merchCoin smart contract
        bytes memory payload = abi.encodeWithSignature("balanceOf(address)", _buyer);
        (bool success, bytes memory returnData) = address(merchCoin).call(payload);
        bytes32 balance32 = bytes32(returnData);
        // uint256 balance = balance32.bytesToUint();
        return (uint256(balance32)>=_total_cost);
    }

    function createItemOrder (
        uint256 _item_id,
        uint256[size_size] calldata _item_quantities_ordered_by_size
    ) public {

        // calculate cost
        uint256 running_price = 0;
        uint256 price =  item_ids_to_items[_item_id].price;
        for (uint i = 0; i< _item_quantities_ordered_by_size.length; i++){
            running_price += _item_quantities_ordered_by_size[i] * price;
        }

        // check if can afford (using the address_to_running_cost value + new one)
        // moved this up here from createBigOrder bc why wouldn't we just check here
        require(canAfford(tx.origin,address_to_running_cost[tx.origin]+running_price),"can not afford this order");

        // add cost to address_to_running_cost mapping
        address_to_running_cost[tx.origin] += running_price;

        // wrap into itemOrder object and add to itemOrder mapping
        itemOrderId_to_itemOrder[next_itemOrder_id] = itemOrder(
            _item_id,
            tx.origin,
            _item_quantities_ordered_by_size,
            running_price
        );

        running_address_to_itemOrderIds[tx.origin].push(next_itemOrder_id);
        
        // increment next_itemOrder_id
        next_itemOrder_id++;

    }


    /**
     * expected behavior: creation of BigOrder, increment bigOrderId, emit WarehouseOrder, reset running_address_to_x mappings
        DOES NOT: actually charge the user, or decrease inventory - done in orderSubmitted instead
     */
    function createBigOrder (
        bool _picking_up_in_person,
        string memory _shipping_address
    ) public {

        // figure out student_id from address
        bytes32 netId = adminContractAddress.addressToStudentId(tx.origin);

        // require that next_bigOrder_id isn't already in use
        require(bigOrderId_to_bigOrder[next_bigOrder_id].student_chain_address == address(0x0), "this next_bigOrder_id is already in use");

        // check if can afford (using the address_to_running_cost value + new one)
        require(canAfford(tx.origin,address_to_running_cost[tx.origin]),"can not afford this order");

        

        // OBJECTIVE: Check that there is enough inventory for entire big order

        // 1. Iterate through each itemOrder in bigOrder
        // 2. Iterate through each Size in the itemOrder
        // 3. Check the respective quantities (summed across locations) for that size in inventory (Item struct)
            // and check that there is enough in stock, otherwise revert entire transaction with explanation

        // NOTE:
        // item_ids_to_items[tempItemOrder.item_id] gets the corresponding Item object        

        // for every itemOrder in this bigOrder
        for (uint i = 0; i < running_address_to_itemOrderIds[tx.origin].length; ++i) {
            itemOrder memory tempItemOrder= itemOrderId_to_itemOrder[running_address_to_itemOrderIds[tx.origin][i]];
            Item memory temp_item = item_ids_to_items[tempItemOrder.item_id];

            // for every size ordered for this item
            for (uint j = 0; j < tempItemOrder.item_quantities_ordered_by_size.length; ++j) {
                // for (uint k = 0; k < temp_item.quant_by_size_and_location.length; ++k) { 
                    uint256 inventory_for_size = 0;
                    // sum across all locations for this size in inventory
                    for (uint l = 0; l < temp_item.quant_by_size_and_location[j].length; ++l){
                        inventory_for_size += temp_item.quant_by_size_and_location[j][l];
                    }
                    // if (tempItemOrder.item_sizes_ordered[j] == temp_item.sizes[k]) {
                        if (tempItemOrder.item_quantities_ordered_by_size[j] > inventory_for_size) {
                            next_itemOrder_id -= running_address_to_itemOrderIds[tx.origin].length;
                            require(false, "Not enough stock");
                        }
                    // }
                // }
            }

        }

        // Create bigOrder instance
        bigOrderId_to_bigOrder[next_bigOrder_id] = bigOrder(
            address_to_running_cost[tx.origin],         // tokens_paid
            tx.origin,                                  // student_chain_address
            running_address_to_itemOrderIds[tx.origin], // itemOrderIds
            _picking_up_in_person,
            _shipping_address,
            block.timestamp,                            // time_ordered
            Statuses.Ordered
        );

        // reset address_to_running_cost to 0
        address_to_running_cost[tx.origin] = 0;

        // reset running_address_to_itemOrderIds to empty array
        uint256[] memory empty_array = new uint256[](1);
        running_address_to_itemOrderIds[tx.origin] = empty_array;

        
        netId_to_bigOrderIds[netId].push(next_bigOrder_id);


        next_bigOrder_id++;         // increment next_bigOrder_id

        emit WarehouseOrder(bigOrderId_to_bigOrder[next_bigOrder_id-1]);
        
    }

    /**
     * @param _quantity_by_itemOrder_size_and_location is a 3d array. Outermost level corresponds to the itemOrders, in the same order as they are in the bigOrder
            * the second level corresponds to the sizes, where index is value in Sizes enum
            * and the third level corresponds to the quantity from each location
     * @param _big_order_id is to identify the bigOrder that was fulfilled
     * expected behavior: reduce inventory and charge the user 
     */

    function orderSubmitted (
        uint256 _big_order_id,
        uint256 [] [size_size] [] calldata _quantity_by_itemOrder_size_and_location
        ) public {
        // require(msg.sender == DLab, "must use server script with DLab address to call this function");        // TODO - add this line back - only our backend scripts can send this transaction
        uint256 [] memory _itemOrdersIds = bigOrderId_to_bigOrder[_big_order_id].itemOrderIds;

        // at this point, assuming everything correctly matches

        // the following code correctly reduces inventory based on the amount
        for (uint i = 0; i < _itemOrdersIds.length; ++i) {

            Item memory temp_item = item_ids_to_items[itemOrderId_to_itemOrder[_itemOrdersIds[i]].item_id];

            uint256 [][size_size] memory _size_and_quant_ordered = _quantity_by_itemOrder_size_and_location[i];

            for (uint j = 0; j < _size_and_quant_ordered.length; ++j) {
                for (uint8 k = 0; k < _size_and_quant_ordered[j].length; ++k) { 
                    // decrement inventory for that size at that location (Orders and Items should have identical structure/ordering for location and quantity)
                    uint256 inventory = temp_item.quant_by_size_and_location[j][k];
                    temp_item.quant_by_size_and_location[j][k] -= _size_and_quant_ordered[j][k];
                    if (inventory <= low_inventory_limit){
                        emit LowInventory(_itemOrdersIds[i], temp_item.quant_by_size_and_location[j][k], k, reorder_amount);
                    }
                }
            }
            
        item_ids_to_items[itemOrderId_to_itemOrder[_itemOrdersIds[i]].item_id] = temp_item;
            
        }

        // transfer correct amount from user's account to DLab's account
        merchCoin.transferFrom(bigOrderId_to_bigOrder[_big_order_id].student_chain_address , DLab, bigOrderId_to_bigOrder[_big_order_id].tokens_paid);
    }
    

    /* OLD VERSION, before new requirements 
    function createBigOrder (
        bool _picking_up_in_person,
        string memory _shipping_address
    ) public {

        // figure out student_id from address
        bytes32 netId = adminContractAddress.addressTonetId(tx.origin);
        uint256 blocktime = block.timestamp;
        bytes32 key = (netId | bytes32(blocktime)); // bitwise OR of the blocktime in Hex with the netId
            // string-ish data in bytes32 uses the front and appends a bunch of 0s
            // uints converted to bytes use the end and prepend a bunch of 0s
            // this key generation method will work as long as they are less than 32 bytes combined

        // require that student_id+blocktime key isn't already there
        require(bigOrderId_to_bigOrder[key].student_chain_address == address(0x0));

        // check if can afford (using the address_to_running_cost value + new one)
        require(canAfford(tx.origin,address_to_running_cost[tx.origin]));

        // subtract address_to_running_cost value from senders bank account
        // payments are being sent into the admincontract itself
        adminContractAddress.transferFrom(tx.origin , adminContractAddress,address_to_running_cost[tx.origin]);


        // Create bigOrder instance
        bigOrderId_to_bigOrder[key] = bigOrder(
            address_to_running_cost[tx.origin],         // tokens_paid
            tx.origin,                                  // student_chain_address
            running_address_to_itemOrderIds[tx.origin], // itemOrderIds
            _picking_up_in_person,
            _shipping_address,
            blocktime,                            // time_ordered
            Statuses.Ordered
        );

        // should iterate again through all child itemOrders and reduce the stock for sizes
            // why in here, rather than in createItemOrder?? - BC only here are the transactions actually going through
            // (btw which is why the running_address_to_itemOrderIds and address_to_running_cost mappings exist)
            // we should only change stock after the complete transaction has been confirmed
        
        // OBJECTIVE: Check and update the stock for each item ordered

        // 1. Iterate through each itemOrder in bigOrder
        // 2. Iterate through each Size in the itemOrder
        // 3. Check the respective quantities in the Item object and make sure its allowed

        // 4. Do it all again to actually change the stock

        // NOTE:
        // item_ids_to_items[temp.item_id] will get the respective Item object
        
        
        for (uint i = 0; i < running_address_to_itemOrderIds[tx.origin].length; ++i) {
            itemOrder memory temp = itemOrderId_to_itemOrder[running_address_to_itemOrderIds[tx.origin][i]];
            Item memory temp_item = item_ids_to_items[temp.item_id];

            for (uint j = 0; j < temp.item_sizes_ordered.length; ++j) {
                for (uint k = 0; k < temp_item.sizes.length; ++k) { 
                    if (temp.item_sizes_ordered[j] == temp_item.sizes[k]) {
                        if (temp.item_quantities_ordered[j] > temp_item.stocks[k]) {
                            next_itemOrder_id -= running_address_to_itemOrderIds[tx.origin].length;
                            require(false, "Not enough stock");
                        }
                    }
                }
            }
        }

        for (uint i = 0; i < running_address_to_itemOrderIds[tx.origin].length; ++i) {
            itemOrder memory temp = itemOrderId_to_itemOrder[running_address_to_itemOrderIds[tx.origin][i]];
            Item memory temp_item = item_ids_to_items[temp.item_id];

            for (uint j = 0; j < temp.item_sizes_ordered.length; ++j) {
                for (uint k = 0; k < temp_item.sizes.length; ++k) { 
                    if (temp.item_sizes_ordered[j] == temp_item.sizes[k]) {
                        temp_item.stocks[k] -= temp.item_quantities_ordered[j];
                    }
                }
            }

            itemOrderId_to_itemOrder[running_address_to_itemOrderIds[tx.origin][i]] = temp;
            item_ids_to_items[temp.item_id] = temp_item;
        }


        // increment next_itemOrder_id - why are we doing this here?
        // ANSWER: We shouldn't be doing this here, it's j buggin
        // next_itemOrder_id++;

        // reset address_to_running_cost to 0
        address_to_running_cost[tx.origin] = 0;

        // reset running_address_to_itemOrderIds to empty array
        uint256[] memory empty_array = new uint256[](1);
        running_address_to_itemOrderIds[tx.origin] = empty_array;
         
        // // push this blocktime into netId => blocktime []
        //  if (netId_to_bigOrderIds[netId].length == 0){ // if currently empty, populate it with this ID
        //     netId_to_bigOrderIds[netId] = [blocktime]; // not empty anymore ^
        // }
        // else{
        //     // otherwise push 
        netId_to_bigOrderIds[netId].push(blocktime);
        // }
        
    }
    */

    /**  OLD DATA STRUCTURE FOR ORDERS
        // did not work because complex data structures containing mappings can't be I/O for public functions
    // Struct to store each order
    struct Order { 
        bytes32 student_net_id;
        uint256 tokens_paid;
        address student_chain_address;
        OrderItem [] items_ordered;
        bool picking_up_in_person;
        bytes32 shipping_address;
        bytes32 date_ordered;
        Statuses current_status;
    }
    
    
    //  * goes with above struct, keep them together! for readability
    //  * required because an order might have multiple items, each in multiple sizes/quantities
    //  * this OrderItem struct handles only a single item, and the Order struct contains an array of OrderItems
     
    struct OrderItem {
        bytes32 itemId;
        mapping(bytes32 => uint256) size_to_quantity_ordered;
    }
    
    constructor(address _ERC20Contract, address _adminContractAddress) {
        ERC20Contract = _ERC20Contract;
        adminContractAddress = _adminContractAddress;
    }

    // TODO: Only admin or student who placed the order should be able to do this
    function getOrderDetailsFromOrderId(uint256 _order_id) onlyAdminOrSender(_order_id) public returns (Order memory) {
        return order_ids_to_orders[_order_id];
    }

    function purchase(
            bytes32 memory _student_net_id,
            address _student_address,
            bool _picking_up_in_person,
            bytes32 memory _shipping_address,
            bytes32 memory _date_ordered,
            OrderItem[] calldata _items_ordered
        ) public {
        
        // total the cost and subtract that out
        uint256 totalCost = 0;
        for (uint256 i = 0; i<_items_ordered.length; i++){
            OrderItem memory tempItem = _items_ordered[i];
            uint256 _target_item = tempItem.itemId;
            uint256 _unit_price = item_ids_to_items[_target_item].price;
            uint256 _quantity = 0;
            for (uint256 j = Statuses.XXS; j <= Statuses.XXXL; j++) {
                _quantity += tempItem.size_to_quantity_ordered[j];
            }
            totalCost += _quantity * _unit_price;
        }

        // Make sure the user has enough credits to buy the item
        // require( something to check their current balance);

        // adding the order to the record
        // mapping(bytes32 => uint256) size_to_quantity_ordered;
        // size_to_quantity_ordered[_size] = _quantity;
        order_ids_to_orders[latest_order_id] = Order(
            _student_net_id,
            totalCost, 
            msg.sender, 
            _items_ordered, 
            _picking_up_in_person,
            _shipping_address,
            _date_ordered,
            Statuses.Ordered
        );
        latest_order_id++;
    }
    */

}
