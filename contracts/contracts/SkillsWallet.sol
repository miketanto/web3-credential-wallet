// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// FOR ABI VERIFICATION, first flatten contract
// npm run flatten

// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
// import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// NOTE:
// Should we use IERC1155MetadataURI to get URI of given ID? Conventional ERC1155 returns
// the same URI with `{id}` for clients to replace manually with whatever token ID.
// Akin to https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol#L93
// `function tokenURI(uint256 tokenId)`

// NOTE:
// Right now, uri() returns same URI with `{id}`. When replaced, it returns JSON metadata of that ID (for token).
// To get the image of that token, we need another call to the actual image after getting that JSON metadata,
// since the metadata contains the image link. For Skills Wallet v1, image isn't really important. But in the future,
// we may have to keep a separate mapping of hashes to either JSON metadata or images, and return both concurrently
// on some function call (e.g. uri(uint256 tokenId) will return both links))

// NOTE:
// Solution to the uri with images and data could be by overiding the uri to give the id or hash of an ipfs

// NOTE:
// Static analyzer: slither contracts/SkillsWallet.sol --solc-remaps @openzeppelin=node_modules/@openzeppelin

// TODO: Implement ERC1155Receiver to add custom hooks on receiving ERC1155.

//TODO:
// Make sure string length is bounded
// URIStorage with ipfs hashes

//TODO:
//Testing:
//1. Test New Admin Feature
//2. Test New clearance Feature
//3. Test New URI storage feature
//4. Add Events

contract SkillsWallet is ERC1155, ERC1155Burnable, ERC1155URIStorage, Ownable {
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    //ERC-1155 Token Counters
    Counters.Counter private _tokenIds;

    uint256[] private _tokenIdArray;

    //Roles
    address private admin;

    EnumerableSet.AddressSet private _heads;

    EnumerableSet.AddressSet private _credentialers; // accounts with authority to mint credentials

    //Clearance Bindings
    EnumerableSet.Bytes32Set private _credentialerClearance; //Key is hash of type and address

    mapping(address => bytes32[]) private _credentialerClearances;

    //Type Bindings
    EnumerableSet.Bytes32Set private _credentialTypes; //Typecheck if real

    mapping(uint256 => string) private _credentialIdType; //The credential type for a specific credential ID

    //Constructor
    constructor(string memory _uri, address credentialer) ERC1155(_uri) {
        _setBaseURI(_uri);
        _credentialers.add(credentialer);
        _heads.add(credentialer);
        admin = credentialer;
    }

    // Events
    event Create(
        address indexed credentialer,
        uint256 indexed credentialId,
        uint256 time
    );

    //Event for Adding a credentialer
    //Event for removing a credentialer
    //Event for Adding Head
    //Event for Removing Head

    // Modifiers
    modifier onlyAdmin() {
        require((admin == _msgSender()) == true, "Not the contract admin");
        _;
    }

    modifier onlyHead() {
        require(_heads.contains(_msgSender()) == true, "Not an approved head");
        _;
    }

    modifier onlyCredentialer() {
        require(
            _credentialers.contains(_msgSender()) == true,
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
            abi.encodePacked(typeHash, _msgSender())
        );
        require(
            _credentialerClearance.contains(clearanceHash) == true,
            "Don't have clearance for this credential type"
        );
        _;
    }

    // Override
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual override onlyCredentialer {
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: caller is not owner nor approved"
        );
        _safeTransferFrom(from, to, id, amount, data);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual override onlyCredentialer {
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: transfer caller is not owner nor approved"
        );
        _safeBatchTransferFrom(from, to, ids, amounts, data);
    }

    function uri(uint256 _tokenId)
        public
        view
        override(ERC1155, ERC1155URIStorage)
        returns (string memory)
    {
        return ERC1155URIStorage.uri(_tokenId);
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
        if (_msgSender() != admin) {
            bytes32 senderClearanceHash = keccak256(
                abi.encodePacked(typeHash, _msgSender())
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
    }

    function addCredentialer(address _credentialer, string memory _type)
        public
        onlyHead
    {
        // New credentialer is now authorized to call smart contract functions
        addCredentialerClearance(_credentialer, _type);
        _credentialers.add(_credentialer);
    }

    function addHead(address _head, string memory _type) public onlyAdmin {
        if (_credentialers.contains(_head) == false) {
            addCredentialer(_head, _type);
        }
        _heads.add(_head);
        if (hasClearance(_head, _type) == false) {
            addCredentialerClearance(_head, _type);
        }
    }

    //Credentialer Layer

    function removeHead(address _head) public onlyAdmin {
        _heads.remove(_head);
    }

    function removeCredentialer(address _credentialer) public onlyHead {
        require(
            _credentialers.contains(_msgSender()) == true,
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
    }

    /*function removeCredentialerClearance(
        address _credentialer,
        string memory _type
    ) public onlyHead typeValidator(_type) {
        require(
            _credentialerClearances[_credentialer].length - 1 > 0,
            "At least one clearance for each credentialer"
        );
        bytes32 typeHash = keccak256(abi.encodePacked(_type));
        if (_msgSender() != admin) {
            bytes32 senderClearanceHash = keccak256(
                abi.encodePacked(typeHash, _msgSender())
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
    }*/

    //Credential types

    function createCredentialType(string memory _credentialType)
        public
        onlyAdmin
    {
        bytes32 typeHash = keccak256(abi.encodePacked(_credentialType)); //might have to be storage here
        _credentialTypes.add(typeHash);
    }

    function removeCredentialType(string memory _credentialType)
        public
        onlyAdmin
    {
        bytes32 typeHash = keccak256(abi.encodePacked(_credentialType)); //might have to be storage here
        _credentialTypes.remove(typeHash);
    }

    function createCredential(string memory _type, string memory _uri)
        public
        onlyHead
        typeValidator(_type)
        onlyCleared(_type)
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newCredId = _tokenIds.current();
        _tokenIdArray.push(newCredId);
        _credentialIdType[newCredId] = _type;
        _setURI(newCredId, _uri);
        emit Create(msg.sender, newCredId, block.timestamp);
        return newCredId;
    }

    function issueCredential(address receiver, uint256 credId)
        public
        onlyCredentialer
    {
        require(credId <= _tokenIds.current(), "Invalid credential ID");

        bytes32 typeHash = keccak256(
            abi.encodePacked(_credentialIdType[credId])
        );
        require(
            _credentialTypes.contains(typeHash) == true,
            "Not a valid credential type"
        );
        bytes32 clearanceHash = keccak256(
            abi.encodePacked(typeHash, _msgSender())
        );
        require(
            _credentialerClearance.contains(clearanceHash) == true,
            "Don't have clearance for this credential type"
        );
        _mint(receiver, credId, 1, "");
    }

    //Utility
    function isCredentialer(address addr) public view returns (bool) {
        return _credentialers.contains(addr);
    }

    function getCredentialerCount() public view returns (uint256) {
        return _credentialers.length();
    }

    function isHead(address addr) public view returns (bool) {
        return _heads.contains(addr);
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

    function getUserTokens(address user)
        external
        view
        returns (uint256[] memory userTokens)
    {
        // Get number of credentials owned by a learner
        address[] memory accountArray = new address[](_tokenIds.current());
        for (uint256 i = 0; i < _tokenIds.current(); i++) {
            accountArray[i] = user; // no push for memory; since we know the size, alloc & write
        }
        return balanceOfBatch(accountArray, _tokenIdArray);
    }

    function tokenId() public view returns (uint256) {
        return _tokenIds.current();
    }
}
