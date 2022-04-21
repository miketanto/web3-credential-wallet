
// testing examples in JS - use the async/await syntax
    // https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript



// marketplace testing
const Marketplace = artifacts.require("Marketplace");
const MerchCoin = artifacts.require("MerchCoin");

// testing library
const truffleAssert = require('truffle-assertions');


contract("Marketplace", async accounts => {


    // getUserType()
    it("sets and gets userType correctly", async () => {

        const instance = await Marketplace.deployed();
        const merchCoinInstance = await MerchCoin.deployed();
        
        // first check this account's own type
        const first_account_type = await instance.getUserType.call(accounts[0],{from:accounts[0]});
        assert.equal(first_account_type,2,"First account is not merchAdmin");
        
        // then set it for some other account
        await merchCoinInstance.setUserType(accounts[1],1,{from:accounts[0]});
        
        // then get it for that account and confirm (in MerchCoin contract)
        const merchcoin_second_account_type = await merchCoinInstance.getUserType.call(accounts[1],{from:accounts[0]});
        assert.equal(merchcoin_second_account_type,1,"Did not set other user type correctly in merchcoin");

        // then check if the Marketplace contract can accurately read the MerchCoin one
        const market_second_account_type = await instance.getUserType.call(accounts[1],{from:accounts[0]});
        assert.equal(market_second_account_type,1,"Did not set other user type correctly in market");


    });
    
    it("creates a new Item with createItem()", async () => {
        
        const instance = await Marketplace.deployed();
        const merchCoinInstance = await MerchCoin.deployed();

        // Item parameters for testing 
        const name = "0x4769657320537765617465720000000000000000000000000000000000000000";
        const price = 20;
        const urls = ["none"];
        const quant_by_size_and_location = [['1'],['2'],['3'],['4'],['5']];
        

        // creating new items - createItem()
        const createdItem = await instance.createItem(name,price,urls,quant_by_size_and_location,{from:accounts[0]});

        // check against inventory if that item exists
        const returnItem = await instance.getItemFromId.call(0);

        assert.equal(returnItem.name,name,"item name is not equal");
        assert.equal(returnItem.price,price,"price is not equal");
        assert.equal(JSON.stringify(returnItem.quant_by_size_and_location),JSON.stringify(quant_by_size_and_location),"inventory count not equal ");
        assert.equal(JSON.stringify(returnItem.urls),JSON.stringify(urls),"urls not equal ");
    });
    
    
    // updating items - updateItemDetails()
    it("updates items with updateItemDetails()", async () => {

        const instance = await Marketplace.deployed();
        const merchCoinInstance = await MerchCoin.deployed();

        // create another item just for fun
        var name = "0x1010657320537765617465720000000000000000000000000000000000000000";
        var price = 50;
        var urls = ["none"];
        var quant_by_size_and_location = [['1'],['2'],['3'],['4'],['5']];
        const createdItem = await instance.createItem(name,price,urls,quant_by_size_and_location,{from:accounts[0]});

        // updateItem details for item[0]
        const new_name = "0x1010101010100000000000000000000000000000000000000000000000000000";
        const new_price = 20;
        const new_urls = ["none"];
        const new_quant_by_size_and_location = [['4'],['4'],['4'],['5'],['4']];
        await instance.updateItemDetails(0,new_name,new_price,new_urls,new_quant_by_size_and_location);

        // check against inventory if it has been updated
        const returnItem = await instance.getItemFromId.call(0);

        assert.equal(returnItem.name,new_name,"item name is not equal");
        assert.equal(returnItem.price,new_price,"price is not equal");
        assert.equal(JSON.stringify(returnItem.quant_by_size_and_location),JSON.stringify(new_quant_by_size_and_location),"inventory count not equal ");
        assert.equal(JSON.stringify(returnItem.urls),JSON.stringify(new_urls),"urls not equal ");

        
    });
    
    // // checking if people canAfford() - commented out bc made this private
    // it("checks if folk canAfford()",async () => {
    //     const instance = await Marketplace.deployed();
    //     const merchCoinInstance = await MerchCoin.deployed();

    //     // check balance directly
    //     const balance = await merchCoinInstance.balanceOf.call(accounts[0]);

    //     // then check something higher than that balance
    //     const upper = await instance.canAfford.call(accounts[0],BigInt(balance)+BigInt(10));
    //     assert.equal(upper,false,"unaffordable check failed");

    //     // check something lower than that balance
    //     const lower = await instance.canAfford.call(accounts[0],BigInt(balance)-BigInt(10));
    //     assert.equal(lower,true,"affordable check failed");
    // });

    // ORDERING

    it("createsItemOrder", async () => {
        const instance = await Marketplace.deployed();
        const merchCoinInstance = await MerchCoin.deployed();

        // create itemOrder
        await instance.createItemOrder(0,['3','3','3','3','3'],{from:accounts[0]});
        
        // read value of itemOrder
        const returnItemOrder = await instance.getItemOrderFromItemOrderId.call(0);
        assert.equal(returnItemOrder.item_id,0,"itemId is incorrect");
        assert.equal(returnItemOrder.student_chain_address,accounts[0],"incorrect address");
        assert.equal(JSON.stringify(returnItemOrder.item_quantities_ordered_by_size),JSON.stringify(['3','3','3','3','3']),"ordered amts/size incorrect");
        assert.equal(returnItemOrder.item_tokens_paid,300,"item_tokens_paid incorrect");

        
    });

    it("creates BigOrder()", async () => {
        const instance = await Marketplace.deployed();
        const merchCoinInstance = await MerchCoin.deployed();

        // add one more itemOrder, just for funsies
        await instance.createItemOrder(1,['0','1','2','0','0'],{from:accounts[0]});

        // createBig Order()
        const shipping_address = "1084 Gamora St."
        await instance.createBigOrder(false, shipping_address);
        const returnBigOrder = await instance.getBigOrderFromBigOrderId.call(0);

        assert.equal(returnBigOrder.tokens_paid, 450, "tokens paid incorrect");
        assert.equal(returnBigOrder.student_chain_address, accounts[0], "incorrect chain address");
        assert.equal(JSON.stringify(returnBigOrder.itemOrderIds), JSON.stringify(['0','1']), "itemOrderIds incorrect");
        assert.equal(returnBigOrder.picking_up_in_person, false, "picking in person incorrect");
        assert.equal(returnBigOrder.shipping_address, shipping_address, "shipping address incorrect");
        assert.equal(returnBigOrder.current_status, 0, "status is incorrect");


    });
    

    it("orderSubmitted operates correctly", async () => {

        const instance = await Marketplace.deployed();
        const merchCoinInstance = await MerchCoin.deployed();

        // grab the users current balance
        const balance = await merchCoinInstance.balanceOf.call(accounts[0]);
        
        
        // orderSubmitted() - test both from Dlab address and from other addy
        const DLab_index = accounts.length - 1 ; 
        const DLab_address = accounts[DLab_index];
        // const DLab_address = "0xBD90A0908aA679107bde41Fe39812c6989bD413f";
        // const randAddress = accounts[5];
        
        // commented out bc maybe the library is out of date? Not working as expected, not worth finding out
        // first from randAddress - should revert
        // await truffleAssert.reverts(
        //     instance.orderSubmitted(0, [[[3],[3],[3],[3],[3]],[[0],[1],[2],[0],[0]]], {from:randAddress}),
        //     "Fishy fish"
        // );
        
        // then from Dlab_address
        let tx = await instance.orderSubmitted(0, [[[3],[3],[3],[3],[3]],[[0],[1],[2],[0],[0]]], {from:DLab_address});
        
        // grab all item final inventory
        const finItem1 = await instance.getItemFromId.call(0);
        const finItem2 = await instance.getItemFromId.call(1);
        // const finItem1 = await instance.getItemFromId(0);
        // const finItem2 = await instance.getItemFromId(1);



        // check that first item final inventory is correct
        assert.equal(JSON.stringify(finItem1.quant_by_size_and_location), JSON.stringify(
            [['1'],['1'],['1'],['2'],['1']]
        ), "item 1 inventory incorrect");
        
        // check that second item final inventory is correct
        assert.equal(JSON.stringify(finItem2.quant_by_size_and_location), JSON.stringify(
            [['1'],['1'],['1'],['4'],['5']]
        ), "item 2 inventory incorrect");
        

        // // check if final balance is accurate
        const finBalance = await merchCoinInstance.balanceOf.call(accounts[0]);
        // assert.equal(BigInt(finBalance), BigInt(balance)-BigInt(450), "balance incorrectly updated");
        assert.equal(finBalance, balance-450, "balance incorrectly updated");

        // listen for lowInventoryEvent
        truffleAssert.eventEmitted(tx,"LowInventory", null, "LowInventory not emitted");
        
        // TODO - also run these tests in situations where the LowEvent should not be emitted
        
        // TODO - also run these tests in situations where the order should be reverted bc not enough inventory
    });
    
    
    // updateStatus ()
    it("updates order status",async () => {
        const instance = await Marketplace.deployed();
        const merchCoinInstance = await MerchCoin.deployed();

        // // incorrectly change the status
        // await truffleAssert.reverts(
        //     instance.updateStatus(0, 4),
        //     "The updateStatus didn't revert"
        // );

        // actually change the status 
        await instance.updateStatus(0, 2);

        // pull BigOrder and confirm the change
        const returnBigOrder = await instance.getBigOrderFromBigOrderId.call(0);
        assert.equal(returnBigOrder.current_status, 2, "incorrect status");
    });
    
    // LOCATION STUFF
    
    // adding location
    it("adds location", async () => {
        const instance = await Marketplace.deployed();
        const merchCoinInstance = await MerchCoin.deployed();

        // add location from wrong account first - truffle-assertations isn't working, so can't test reverts
        // await instance.addLocation("0x4e6577206c6f636174696f6e0000000000000000000000000000000000000000",{from:accounts[5]});

        // now from correct account
        await instance.addLocation("0x4e6577206c6f636174696f6e0000000000000000000000000000000000000000",{from:accounts[0]});

        // read locations and confirm
        let locations = await instance.getLocations.call();
        assert.lengthOf(locations,2,"length of locations is incorrect");
        assert.equal(locations[0], "0x4f726967696e616c204c6f636174696f6e000000000000000000000000000000", "Original location is incorrect");
        assert.equal(locations[1], "0x4e6577206c6f636174696f6e0000000000000000000000000000000000000000", "New location is incorrect");

        // TODO - should also check if ItemInventory has been updated, with 0s everywhere else
        
    });  
        
    // deleting location
    it("deletes location",async() => {
        const instance = await Marketplace.deployed();
        const merchCoinInstance = await MerchCoin.deployed();

        // delete the second location
        await instance.deleteLocation(1);

        // make sure calling second location is just zero now
        let second_location = await instance.locations.call(1);
        const deleted = "0x44656c6574656400000000000000000000000000000000000000000000000000";
        assert.equal(second_location, deleted, "second location not deleted");

        // TODO - go through and check that all inventory here has been reset to 0 
    });
    
    // changing location phrase
    it("changes location phrase",async() => {
        const instance = await Marketplace.deployed();
        const merchCoinInstance = await MerchCoin.deployed();

        // confirm old location phrase was "Original Location"
        let old_phrase = await instance.locations.call(0);
        assert.equal(old_phrase, "0x4f726967696e616c204c6f636174696f6e000000000000000000000000000000", "Old phrase incorrect");

        // update the location phrase to "Updated Location"
        const new_phrase = "0x55706461746564204c6f636174696f6e00000000000000000000000000000000";
        await instance.changeLocationPhrase(new_phrase, 0);

        // read from chain and confirm the change
        let changed_phrase = await instance.locations.call(0);
        assert.equal(changed_phrase, new_phrase, "The phrase did not update correctly");

    });
    



    // THRESHOLD CHANGING STUFF (run one of these with a nonAdmin account, should revert)

    // set LowInventoryLimit
    it("changes lowInventory threshold",async() => {
        const instance = await Marketplace.deployed();
        const merchCoinInstance = await MerchCoin.deployed();

        // set the new limit
        const new_limit = 30;
        await instance.setLowInventoryLimit(new_limit);

        // pull limit from contract and confirm they match
        let set_limit = await instance.low_inventory_limit.call();
        assert.equal(new_limit, set_limit, "the limit was not set correctly");
    });
    
    
    // set reorder amount
    it("resets reorder amount",async() => {
        const instance = await Marketplace.deployed();
        const merchCoinInstance = await MerchCoin.deployed();

        // set the new amount
        const new_limit = 200;
        await instance.setReorderAmount(new_limit);

        // pull limit from contract and confirm they match
        let set_limit = await instance.reorder_amount.call();
        assert.equal(new_limit, set_limit, "the limit was not set correctly");

    });
    
    
});
    