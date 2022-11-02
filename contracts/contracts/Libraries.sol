// Libraries

pragma solidity ^0.8.6; //<0.8.0;
// SPDX-License-Identifier: UNLICENSED


// Library containing utility functions 
// all functions that don't take bytes32s as first argument
    // use bytes32 throwaway parameter so that they can still be imported in a single bytes32 library
library UtilFunctions {

    // INCOMPLETE  - create empty bytes32, copy over each byte in bytes32 a until we reach 0x00, then do the same for bytes32 b
        // above algo assumes that combined length fits within bytes32 (ie <=32 chars)
    function append(bytes32 a, bytes32  b) internal pure returns (bytes32) {
        return bytes32(abi.encodePacked(a, b));
    }
    
    // conversion between bytes and human-readable string should be done in JS frontend


}

// Library containing permission-related functions and money transfer functions
library Accessibility {

    /**
     * Checks if an address is an admin
     * should talk to the admin smart contract
     * @param _address the user who we're check if is admin
     * @param _admin_contract_address the Admin contract's address
     * @return bool whether or not the address belongs to an admin
     */
    function isAdmin(address _admin_contract_address, address _address) public returns (bool) {

        // talk to admin smart contract
        bytes memory payload = abi.encodeWithSignature("isAdmin(address)", _address);
        (bool success, bytes memory returnData) = address(_admin_contract_address).call(payload);
        return (returnData[returnData.length - 1] == 0x01);
    }

    /**
     * Checks if an address is on Gies Blacklist
     * should talk to the admin smart contract
     * @param _address the user who we're checking if is blacklisted
     * @param _admin_contract_address the Admin's contract's address
     * @return bool whether or not the address belongs to an admin
     */
    function isBlacklisted(address _address, address _admin_contract_address) public returns (bool) {
        // talk to admin smart contract
        bytes memory payload = abi.encodeWithSignature("isBlacklisted(address)", _address);
        (bool success, bytes memory returnData) = address(_admin_contract_address).call(payload);
        return (returnData[returnData.length - 1] == 0x01);
    }

    // TODO - resolve this along with Admin.sol same issue    
    // function studentIdToAddress (address _admin_contract_address, bytes32 _studentId) public returns (address[] memory){
    //     bytes memory payload = abi.encodeWithSignature("studentIdToASddress(bytes32 calldata)", _studentId);
    //     (bool success, bytes memory returnData) = address(_admin_contract_address).call(payload);
    //     address memory _retVal
    //     return address(returnData);
    //     // TODO INCOMPLETE - convert returnData to address[] and return that
    // }

    
    function addressToStudentId (address _admin_contract_address, address _address) public returns (bytes32 studentId){
        bytes memory payload = abi.encodeWithSignature("addressToStudentId(address)", _address);
        (bool success, bytes memory returnData) = address(_admin_contract_address).call(payload);
        return bytes32(returnData);
    }

    function transferFrom(address _admin_contract_address, address _from, address _to, uint256 _value) public returns (bool) {
        bytes memory payload = abi.encodeWithSignature("transferFrom(address,address,uint256)", _from, _to, _value);
        (bool success, bytes memory returnData) = address(_admin_contract_address).call(payload);
        return success;        
    }


}
