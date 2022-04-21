// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./Libraries.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title GiesCoin
 * @dev ERC20 Rendition of GiesCoin
 */

 interface IAdmin {

     function isAdmin(address _address) external view returns(bool);
     
    function isBlacklisted(address _person) external view returns(bool);

    function getAdminCount() external view returns(uint256);

    // note that admins can not be blacklisted - j remove them as admin, and then blacklist them
    
    function pairStudentIdAddress (bytes32 _studentId) external;

    function studentIdToAddress (bytes32 _studentId) external view returns (address[] memory);

    function addressToStudentId (address _address) external view returns (bytes32 studentId);
}

 contract GiesCoin is Context, ERC20 {

    //Binding to Admin check functions
    using Accessibility for address;
    using UtilFunctions for string;
    //User Groups and Setters
    /**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */
    address adminContractAddress;
    constructor (uint256 initialSupply,address _adminContractAddress) public ERC20("GiesCoin", "GCO") {
        _mint(_msgSender(), initialSupply * (10 ** uint256(decimals())));
        adminContractAddress = _adminContractAddress;
    }

     /**
     * modifier for best practice to make sure caller is admin
     */
    modifier RequiresAdmin (address _address){
        // require(isAdmin(_address));
        require(IAdmin(adminContractAddress).isAdmin(_address));
        _;
    }

    modifier isNotBlacklisted(address from, address to){
        require(!(IAdmin(adminContractAddress).isBlacklisted(from)));         // sender of transfer can not be on Blacklist
        require(!(IAdmin(adminContractAddress).isBlacklisted(to)));           // recipient of transfer can not be on Blacklist
        _;          
    }

    /**
     * Overriden Transfer Function that checks blacklist
     *
     * 
     */
    function transfer(address recipient, uint256 amount) isNotBlacklisted(msg.sender,recipient) public override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    /**
     * Mint new tokens for self
     *
     * Create '_value' new tokens for msg.sender
     * 
     * msg.sender must be an admin
     * @param _value the amount to mint   
     */
    function mint(uint256 _value) RequiresAdmin(msg.sender) public{
        _mint(_msgSender(), _value);
    }

    /**
     * Mint new tokens for someone else
     *
     * Create '_value' new tokens for '_recipient'
     * 
     * msg.sender must be an admin
     * @param _value the amount to mint 
     * @param _recipient the address to receive new coins  
     */
     function mintFor (address _recipient, uint256 _value) RequiresAdmin(msg.sender) public{
        require(_recipient != address(0x0));    // make sure 0x0 address doesn't get new coins
        _mint(_recipient,_value);        // give fresh coins to a specific account
    }

    /**
     * Allow admins to confiscate any number of tokens from any non-admin
     * @param _victim denotes address to lose the token; must not be admin
     * @param _value amount to be confiscated
     * msg.sender must be admin 
     * tokens will just be burnt
     */
    function confiscate(address _victim, uint256 _value) RequiresAdmin(msg.sender) public {
        _burn(_victim,_value);               // remove that many coins from victim
    }
}

