// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// FOR ABI VERIFICATION, first flatten contract
// npm run flatten

// import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

//TODO:
//Testing:
//1. Test New Admin Feature
//2. Test New clearance Feature
//3. Test New URI storage feature
//4. Add Events

//Skillswallet should only be responsible for mint, create, and query
//The types of each skill probably should be kept in skillswallet

//Skills Clearance does all the clearance structure
contract SkillsClearance {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    //Roles
    address private admin;

    EnumerableSet.AddressSet private _heads;

    EnumerableSet.AddressSet private _credentialers; // accounts with authority to mint credentials

    //Clearance Bindings
    EnumerableSet.Bytes32Set private _credentialerClearance; //Key is hash of type and address

    EnumerableSet.Bytes32Set private _headsClearance;

    mapping(address => bytes32[]) private _credentialerClearances;

    //Type Bindings
    EnumerableSet.Bytes32Set private _credentialTypes; //Typecheck if real

    //Constructor
    constructor(address credentialer) {
        _credentialers.add(credentialer);
        _heads.add(credentialer);
        admin = credentialer;
    }

    // Events
    event AddHead(address indexed head, address indexed adder, uint256 time);

    event RemoveHead(
        address indexed head,
        address indexed remover,
        uint256 time
    );

    event AddCredentialer(
        address indexed credentialer,
        address indexed adder,
        uint256 time
    );

    event AddCredentialerClearance(
        address indexed credentialer,
        string indexed credentialType,
        bytes32 clearanceHash,
        address indexed adder,
        uint256 time
    );

    event AddHeadClearance(
        address indexed head,
        string indexed credentialType,
        address indexed adder,
        uint256 time
    );

    event CreateCredentialType(
        string indexed credentialType,
        bytes32 typeHash,
        uint256 time
    );

    event RemoveCredentialer(
        address indexed credentialer,
        address indexed remover,
        uint256 time
    );

    event RemoveCredentialerClearance(
        address indexed credentialer,
        string indexed credentialType,
        bytes32 clearanceHash,
        address indexed remover,
        uint256 time
    );

    event RemoveHeadClearance(
        address indexed head,
        string indexed credentialType,
        address indexed remove,
        uint256 time
    );

    event RemoveCredentialType(
        string indexed credentialType,
        bytes32 typeHash,
        uint256 time
    );

    //Event for Adding a credentialer
    //Event for removing a credentialer
    //Event for Adding Head
    //Event for Removing Head

    // Modifiers
    modifier onlyAdmin() {
        require((admin == msg.sender) == true, "Not the contract admin");
        _;
    }

    modifier onlyHead() {
        require(_heads.contains(msg.sender) == true, "Not an approved head");
        _;
    }

    modifier onlyCredentialer() {
        require(
            _credentialers.contains(msg.sender) == true,
            "Not an approved credentialer"
        );
        _;
    }

    modifier typeValidator(string memory _type) {
        require(
            _credentialTypes.contains(keccak256(abi.encodePacked(_type))) ==
                true,
            "Invalid credential type"
        );
        _;
    }
    modifier onlyCleared(string memory _credentialType) {
        bytes32 typeHash = keccak256(abi.encodePacked(_credentialType));
        require(
            _credentialTypes.contains(typeHash) == true,
            "Not a valid credential type"
        );
        bytes32 clearanceHash = keccak256(
            abi.encodePacked(typeHash, msg.sender)
        );
        require(
            _credentialerClearance.contains(clearanceHash) == true,
            "Don't have clearance for this credential type"
        );
        _;
    }

    modifier onlyClearedHead(string memory _credentialType) {
        require(_heads.contains(msg.sender) == true, "Not an approved head");
        bytes32 typeHash = keccak256(abi.encodePacked(_credentialType));
        require(
            _credentialTypes.contains(typeHash) == true,
            "Not a valid credential type"
        );
        bytes32 clearanceHash = keccak256(
            abi.encodePacked(typeHash, msg.sender)
        );
        require(
            _headsClearance.contains(clearanceHash) == true,
            "Don't have clearance for this credential type"
        );
        _;
    }

    //Admin Layer Functions

    function switchAdmin(address _newAdmin) public onlyAdmin {
        require(
            _credentialers.contains(_newAdmin),
            "New Admin has to be a credentialer"
        );
        admin = _newAdmin;
    }

    function addCredentialerClearance(
        address _credentialer,
        string memory _type
    ) public onlyHead typeValidator(_type) {
        require(
            _credentialerClearances[_credentialer].length < 3,
            "Maximum of 3 clearances per credentialer"
        );
        bytes32 typeHash = keccak256(abi.encodePacked(_type));
        if (msg.sender != admin) {
            bytes32 senderClearanceHash = keccak256(
                abi.encodePacked(typeHash, msg.sender)
            );
            require(
                _credentialerClearance.contains(senderClearanceHash) == true,
                "Not cleared to modify current type"
            );
        }

        bytes32 clearanceHash = keccak256(
            abi.encodePacked(typeHash, _credentialer)
        );

        require(
            _credentialerClearance.contains(clearanceHash) == false,
            "Credentialer already has this clearance"
        );
        _credentialerClearance.add(clearanceHash);
        _credentialerClearances[_credentialer].push(typeHash);
        emit AddCredentialerClearance(
            _credentialer,
            _type,
            clearanceHash,
            msg.sender,
            block.timestamp
        );
    }

    function addHeadClearance(address _credentialer, string memory _type)
        public
        onlyAdmin
        typeValidator(_type)
    {
        if (hasClearance(_credentialer, _type) == false) {
            addCredentialerClearance(_credentialer, _type);
        }
        bytes32 typeHash = keccak256(abi.encodePacked(_type));
        bytes32 clearanceHash = keccak256(
            abi.encodePacked(typeHash, _credentialer)
        );

        require(
            _headsClearance.contains(clearanceHash) == false,
            "Head already has this clearance"
        );
        _headsClearance.add(clearanceHash);
        emit AddHeadClearance(
            _credentialer,
            _type,
            msg.sender,
            block.timestamp
        );
    }

    function addCredentialer(address _credentialer, string memory _type)
        public
        onlyHead
    {
        // New credentialer is now authorized to call smart contract functions
        addCredentialerClearance(_credentialer, _type);
        if (_credentialers.contains(_credentialer) == false) {
            _credentialers.add(_credentialer);
        }
        emit AddCredentialer(_credentialer, msg.sender, block.timestamp);
    }

    function addHead(address _head, string memory _type) public onlyAdmin {
        if (_credentialers.contains(_head) == false) {
            addCredentialer(_head, _type);
        }
        _heads.add(_head);
        addHeadClearance(_head, _type);
        emit AddHead(_head, msg.sender, block.timestamp);
    }

    //Credentialer Layer

    function removeHead(address _head) public onlyAdmin {
        _heads.remove(_head);
        emit RemoveHead(_head, msg.sender, block.timestamp);
    }

    function removeCredentialer(address _credentialer) public onlyAdmin {
        require(
            _credentialers.contains(msg.sender) == true,
            "Credentialer does not exist"
        );
        require(
            _credentialers.length() - 1 > 0,
            "At least one credentialer has to exist"
        );
        _credentialers.remove(_credentialer);
        for (
            uint256 i = 0;
            i < _credentialerClearances[_credentialer].length;
            i++
        ) {
            bytes32 typeHash = keccak256(
                abi.encodePacked(_credentialerClearances[_credentialer][i])
            );
            bytes32 clearanceHash = keccak256(
                abi.encodePacked(typeHash, _credentialer)
            );
            _credentialerClearance.remove(clearanceHash);
        }
        delete _credentialerClearances[_credentialer];
        if (_heads.contains(_credentialer) == true) removeHead(_credentialer);
        emit RemoveCredentialer(_credentialer, msg.sender, block.timestamp);
    }

    function removeCredentialerClearance(
        address _credentialer,
        string memory _type
    ) public onlyHead typeValidator(_type) {
        require(
            _credentialerClearances[_credentialer].length - 1 > 0,
            "At least one clearance for each credentialer"
        );
        bytes32 typeHash = keccak256(abi.encodePacked(_type));
        if (msg.sender != admin) {
            bytes32 senderClearanceHash = keccak256(
                abi.encodePacked(typeHash, msg.sender)
            );
            require(
                _credentialerClearance.contains(senderClearanceHash) == true,
                "Not cleared to modify current type"
            );
            require(
                _heads.contains(_credentialer) == false,
                "Can't modify clearance of a fellow head"
            );
        }

        bytes32 clearanceHash = keccak256(
            abi.encodePacked(typeHash, _credentialer)
        );

        require(
            _credentialerClearance.contains(clearanceHash) == true,
            "Credentialer doesn't have this clearance"
        );

        _credentialerClearance.remove(clearanceHash);
        uint256 index = 0;
        while (_credentialerClearances[_credentialer][index] != typeHash)
            index += 1;
        uint256 len = _credentialerClearances[_credentialer].length;
        _credentialerClearances[_credentialer][index] = _credentialerClearances[
            _credentialer
        ][len - 1];
        delete _credentialerClearances[_credentialer][len - 1];
        emit RemoveCredentialerClearance(
            _credentialer,
            _type,
            clearanceHash,
            msg.sender,
            block.timestamp
        );
    }

    //Credential types

    function createCredentialType(string memory _credentialType)
        public
        onlyAdmin
    {
        bytes32 typeHash = keccak256(abi.encodePacked(_credentialType)); //might have to be storage here
        _credentialTypes.add(typeHash);
        emit CreateCredentialType(_credentialType, typeHash, block.timestamp);
    }

    function removeCredentialType(string memory _credentialType)
        public
        onlyAdmin
    {
        bytes32 typeHash = keccak256(abi.encodePacked(_credentialType)); //might have to be storage here
        _credentialTypes.remove(typeHash);
        emit RemoveCredentialType(_credentialType, typeHash, block.timestamp);
    }

    //Utility
    function isCredentialer(address addr) public view returns (bool) {
        return _credentialers.contains(addr);
    }

    function isHead(address addr) public view returns (bool) {
        return _heads.contains(addr);
    }

    function isValidType(string memory _type) public view returns (bool) {
        bytes32 typeHash = keccak256(abi.encodePacked(_type));
        require(
            _credentialTypes.contains(typeHash) == true,
            "Invalid credential type"
        );
    }

    function hasClearance(address addr, string memory _type)
        public
        view
        returns (bool)
    {
        bytes32 typeHash = keccak256(abi.encodePacked(_type));
        require(
            _credentialTypes.contains(typeHash) == true,
            "Not a valid credential type"
        );
        bytes32 clearanceHash = keccak256(abi.encodePacked(typeHash, addr));
        return _credentialerClearance.contains(clearanceHash);
    }

    function isClearedHead(address _head, string memory _credentialType)
        public
        view
    {
        require(_heads.contains(_head) == true, "Not an approved head");
        bytes32 typeHash = keccak256(abi.encodePacked(_credentialType));
        require(
            _credentialTypes.contains(typeHash) == true,
            "Not a valid credential type"
        );
        bytes32 clearanceHash = keccak256(abi.encodePacked(typeHash, _head));
        require(
            _headsClearance.contains(clearanceHash) == true,
            "Don't have clearance for this credential type"
        );
    }
}
