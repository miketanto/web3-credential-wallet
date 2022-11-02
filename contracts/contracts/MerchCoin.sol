// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./Libraries.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ERCMerchCoin
 * @dev ERC20 Rendition of MerchCoin
 * TODO Make Untransferable from party to party
 */

 contract MerchCoin is Context, ERC20 {

    //Binding to Admin check functions
    using Accessibility for address;
    using UtilFunctions for string;
    //User Groups and Setters
    enum Users {student, prof, merchAdmin, approvedContract}          // order matters, bc 0 is default in mapping (student)
    mapping (address => Users) userType;
    address adminContractAddress;

    function getUserType(address _address) public view returns (uint8){
        return uint8(userType[_address]);
    }

    function setUserType(address _address, Users _type) public onlyMerchAdmin{ //onlyMerchAdmin - TODO add back
        userType[_address] = _type;
    }

    modifier onlyMerchAdmin () {
        require(userType[msg.sender]==Users.merchAdmin);
        _;
    }

    modifier onlyProf () {
        require(userType[msg.sender]==Users.prof);
        _;
    }
    
    modifier onlyStudent () {
        require(userType[msg.sender]==Users.student);
        _;
    }

    modifier onlyApproved () {
        require(userType[msg.sender]==Users.merchAdmin||userType[msg.sender]==Users.approvedContract);
        _;
    }


    modifier nonStudent () {
        require ((userType[msg.sender]==Users.prof) || (userType[msg.sender]==Users.merchAdmin));
        _;
    }

    function makeMerchAdmin (address _new_admin) public onlyMerchAdmin {
        userType[_new_admin] = Users.merchAdmin;
    }

    function makeProf (address _new_prof) public nonStudent {
        userType[_new_prof] = Users.prof;
    }

    function makeStudent (address _new_student) public onlyMerchAdmin {
        userType[_new_student] = Users.student;
    }

    function makeApproved (address _new_approved) public onlyMerchAdmin {
        userType[_new_approved] = Users.approvedContract;
    }

    /**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */
    constructor (uint256 initialSupply,address _adminContractAddress) public ERC20("MerchCoin", "MCO") {
        _mint(_msgSender(), initialSupply * (10 ** uint256(decimals())));
        userType[msg.sender] = Users.merchAdmin;
        adminContractAddress = _adminContractAddress;
    }

     /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `recipient` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */

    function transfer(address recipient, uint256 amount) public override onlyApproved returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20}.
     *
     * Requirements:
     *
     * - `sender` and `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     * - the caller must have allowance for ``sender``'s tokens of at least
     * `amount`.
     */

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) onlyApproved public override  returns (bool) {
        _transfer(sender, recipient, amount);

        uint256 currentAllowance = allowance(sender,_msgSender());
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        unchecked {
            _approve(sender, _msgSender(), currentAllowance - amount);
        }

        return true;
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 amount) public override  returns (bool) {
        _approve(_msgSender(), spender, amount);
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
    function mint(uint256 _value) onlyMerchAdmin public{
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
     function mintFor (address _recipient, uint256 _value) onlyMerchAdmin public{
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
    function confiscate(address _victim, uint256 _value) onlyMerchAdmin public {
        _burn(_victim,_value);               // remove that many coins from victim
    }
}