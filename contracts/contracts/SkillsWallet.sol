// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// FOR ABI VERIFICATION, first flatten contract
// npm run flatten

// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
//import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./SkillsClearance.sol";

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
    //ERC-1155 Token Counters
    Counters.Counter private _tokenIds;

    uint256[] private _tokenIdArray;

    mapping(uint256 => string) private _credentialIdType; //The credential type for a specific credential ID

    SkillsClearance public clearanceContract;

    //Constructor
    constructor(string memory _uri, SkillsClearance _clearanceContract)
        ERC1155(_uri)
    {
        _setBaseURI(_uri);
        clearanceContract = _clearanceContract;
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

    // Override
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual override {
        require(
            clearanceContract.isCredentialer(_msgSender()) == true,
            "Not an approved credentialer"
        );
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
    ) public virtual override {
        require(
            clearanceContract.isCredentialer(_msgSender()) == true,
            "Not an approved credentialer"
        );
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

    function createCredential(string memory _type, string memory _uri)
        public
        returns (uint256)
    {
        clearanceContract.isValidType(_type);
        clearanceContract.isClearedHead(_msgSender(), _type);
        _tokenIds.increment();
        uint256 newCredId = _tokenIds.current();
        _tokenIdArray.push(newCredId);
        _credentialIdType[newCredId] = _type;
        _setURI(newCredId, _uri);
        emit Create(msg.sender, newCredId, block.timestamp);
        return newCredId;
    }

    function issueCredential(address receiver, uint256 credId) public {
        require(
            clearanceContract.isCredentialer(_msgSender()) == true,
            "Not an approved credentialer"
        );
        require(credId <= _tokenIds.current(), "Invalid credential ID");
        require(
            clearanceContract.hasClearance(
                _msgSender(),
                _credentialIdType[credId]
            ) == true,
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
