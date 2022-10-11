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

contract SkillsWallet is ERC1155, ERC1155Burnable, ERC1155URIStorage, Ownable {
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // Since Skill NFT is burnable, we manually increment the tokenId to avoid ID collision
    // ie. using _tokenIdArray.length may not return unique value
    Counters.Counter private _tokenIds;

    EnumerableSet.AddressSet private _credentialers; // accounts with authority to mint credentials

    EnumerableSet.Bytes32Set private _credentialTypes; //Typecheck if real

    EnumerableSet.Bytes32Set private _credentialerClearance; //Key is hash of type and address

    mapping(address => bytes32[]) private _credentialerClearances;

    mapping(uint256 => string) private _credentialIdType;

    address private admin;

    uint256[] private _tokenIdArray;

    constructor(string memory _uri, address credentialer) ERC1155(_uri) {
        _setBaseURI(_uri);
        _credentialers.add(credentialer);
        admin = credentialer;
    }

    // Events

    event Create(
        address indexed credentialer,
        uint256 indexed credentialId,
        uint256 time
    );

    // Modifiers

    modifier onlyCredentialer() {
        require(
            _credentialers.contains(_msgSender()) == true,
            "Not an approved credential creator"
        );
        _;
    }

    modifier onlyClearedCredentialer(string memory _credentialType) {
        require(
            _credentialers.contains(_msgSender()) == true,
            "Not an approved credential creator"
        );
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

    modifier onlyAdmin() {
        require((admin == _msgSender()) == true, "Not the contract admin");
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

    // Contract-specific
    function switchAdmin(address _newAdmin) public onlyAdmin {
        require(
            _credentialers.contains(_newAdmin),
            "New Admin has to be a credentialer"
        );
        admin = _newAdmin;
    }

    function addCredentialer(address credentialer, string memory clearance)
        public
        onlyAdmin
        returns (bytes32)
    {
        // New credentialer is now authorized to call smart contract functions
        bytes32 typeHash = keccak256(abi.encodePacked(clearance));
        require(
            _credentialTypes.contains(typeHash),
            "Clearance type does not exist."
        );
        bytes32 clearanceHash = keccak256(
            abi.encodePacked(typeHash, credentialer)
        );
        _credentialerClearance.add(clearanceHash);
        _credentialerClearances[credentialer].push(typeHash);
        _credentialers.add(credentialer);
        return (clearanceHash);
    }

    function removeCredentialer(address credentialer) public onlyAdmin {
        require(
            _credentialers.contains(_msgSender()) == true,
            "Credentialer does not exist"
        );
        require(
            _credentialers.length() - 1 > 0,
            "At least one credentialer has to exist"
        );
        _credentialers.remove(credentialer);
        for (
            uint256 i = 0;
            i < _credentialerClearances[credentialer].length;
            i++
        ) {
            bytes32 typeHash = keccak256(
                abi.encodePacked(_credentialerClearances[credentialer][i])
            );
            bytes32 clearanceHash = keccak256(
                abi.encodePacked(typeHash, credentialer)
            );
            _credentialerClearance.remove(clearanceHash);
        }
        delete _credentialerClearances[credentialer];
    }

    function addCredentialerClearance(
        address _credentialer,
        string memory _credentialType
    ) public onlyAdmin {
        bytes32 typeHash = keccak256(abi.encodePacked(_credentialType));
        require(
            _credentialTypes.contains(typeHash) == true,
            "Not a valid credential type"
        );
        require(
            _credentialerClearances[_credentialer].length < 3,
            "Maximum of 3 clearances per credentialer"
        );
        _credentialerClearances[_credentialer].push(typeHash);
        bytes32 clearanceHash = keccak256(
            abi.encodePacked(typeHash, _credentialer)
        );
        _credentialerClearance.add(clearanceHash);
    }

    function isCredentialer(address addr) public view returns (bool) {
        return _credentialers.contains(addr);
    }

    function getCredentialerCount() public view returns (uint256) {
        return _credentialers.length();
    }

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

    function createCredential(string memory _credentialType, string memory _uri)
        public
        onlyClearedCredentialer(_credentialType)
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newCredId = _tokenIds.current();
        _tokenIdArray.push(newCredId);
        _credentialIdType[newCredId] = _credentialType;
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
