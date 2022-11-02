pragma solidity ^0.8.6;
// SPDX-License-Identifier: UNLICENSED

// commenting this out because already wrapped into compilation from truffle? - TODO confirm
import "./Libraries.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Admin is Ownable{

    // tracking admins and blacklisted folks
    mapping(address => bool) admins;
    uint256 adminCount;
    mapping(address => bool) blacklist;

    // tracking all student IDs and addresses
    mapping (bytes32 => address[]) studentId_to_addresses; // TODO - rm this data structure and functions if unnecessary
    mapping(address => bytes32) address_to_studentId;

    modifier requiresAdmin {
        require(isAdmin(tx.origin));
        _;
    }

    constructor (address _firstAdmin) {
        admins[_firstAdmin] = true; 
        admins[msg.sender] = true;
        adminCount++;                           // increment admin count for the first admin
        if (_firstAdmin != msg.sender){
            adminCount++;                       // increment admin count if the first admin and contract owner are diff
        }
    }
 
    function isAdmin(address _address) public view returns(bool) { 
        return admins[_address]; 
    }
     
    function isBlacklisted(address _person) public view returns(bool) {
        return blacklist[_person];
    }
     
    function addAdmin(address _newAdmin) requiresAdmin public {
        admins[_newAdmin] = true;                   // Adds new admin to mapping =
        adminCount++;                               // Increment adminCount
    }
 
    function removeAdmin(address _badAdmin) requiresAdmin public {
        require(_badAdmin != owner());
        admins[_badAdmin] = false;                   // Sets _badAdmin to false in mapping 
        adminCount--;                               // Decrement adminCount
    }

    function getAdminCount() public view returns(uint256) {
        return adminCount;
    }

    // note that admins can not be blacklisted - j remove them as admin, and then blacklist them
    function addToBlacklist(address _criminal) requiresAdmin public {
        require(!isAdmin(_criminal));
        blacklist[_criminal] = true;
    }

    function removeFromBlacklist(address _parolee) requiresAdmin public {
        blacklist[_parolee] = false;
    }
    
    function pairStudentIdAddress (bytes32 _studentId) public {
        address_to_studentId[tx.origin] = _studentId;   // associate this address with this student
        
        // // if this student doesnn't already have an account, set tx.origin as its account
        // if (studentId_to_addresses[_studentId].length == 0){
        //     studentId_to_addresses[_studentId] = [tx.origin];
        //     return;
        // }

        // // otherwise push 

        // Directly push tx.origin
        studentId_to_addresses[_studentId].push(tx.origin);
    }

    function studentIdToAddress (bytes32 _studentId) public view returns (address[] memory){
        return studentId_to_addresses[_studentId];
    }

    function addressToStudentId (address _address) public view returns (bytes32 studentId){
        return address_to_studentId[_address];
    }
}
