// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// FOR ABI VERIFICATION, first flatten contract
// npm run flatten

// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
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
// Static analyzer: slither contracts/SkillsWallet.sol --solc-remaps @openzeppelin=node_modules/@openzeppelin

// TODO: Implement ERC1155Receiver to add custom hooks on receiving ERC1155.
// NOTE:
// Current version of contract doesn't have idea of credential owernship by credentialers.
// In other words, any credentialer can issue any credential. This doesn't make sense if a credential (faculty)
// issues a credential irrelevant of their department. Thus, in version 2, we should:
// TODO: Restrict credentialer to issue only certain credentials (limited by scope).

contract SkillsWallet is ERC1155, ERC1155Burnable, Ownable  {
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.AddressSet;

    // Since Skill NFT is burnable, we manually increment the tokenId to avoid ID collision
    // ie. using _tokenIdArray.length may not return unique value
    Counters.Counter private _tokenIds;

    EnumerableSet.AddressSet private _credentialers; // accounts with authority to mint credentials

    uint256[] private _tokenIdArray;

    constructor(string memory uri, address credentialer) ERC1155(uri) {
        _credentialers.add(credentialer);
    }

    // Events

    event Create(address indexed credentialer, uint256 indexed credentialId, uint time);

    // Modifiers

    modifier onlyCredentialer() {
        require(
            _credentialers.contains(_msgSender()) == true,
            "Not an approved credential creator"
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
    ) onlyCredentialer public virtual override {
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
    ) onlyCredentialer public virtual override {
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: transfer caller is not owner nor approved"
        );
        _safeBatchTransferFrom(from, to, ids, amounts, data);
    }

    // Contract-specific

    function addCredentialer(address credentialer) onlyCredentialer public {
        // New credentialer is now authorized to call smart contract functions
        _credentialers.add(credentialer);
    }

    function removeCredentialer(address credentialer) onlyCredentialer public {
        require(
            _msgSender() != credentialer,
            "Credentialers cannot remove themselves"
        );
        require(
            _credentialers.contains(_msgSender()) == true,
            "Credentialer does not exist"
        );
        require(
            _credentialers.length() - 1 > 0,
            "At least one credentialer has to exist"
        );
        _credentialers.remove(credentialer);
    }

    function isCredentialer(address addr) public view returns (bool) {
        return _credentialers.contains(addr);
    }

    function getCredentialerCount() public view returns (uint256) {
        return _credentialers.length();
    }

    function createCredential() public onlyCredentialer returns (uint256) {
        _tokenIds.increment();
        uint256 newCredId = _tokenIds.current();
        _tokenIdArray.push(newCredId);

        emit Create(msg.sender, newCredId, block.timestamp);
        // _mint(receiver, newCredId, 1, "");
        return newCredId;
    }

    function issueCredential(address receiver, uint256 credId) public onlyCredentialer {
        require(
            credId <= _tokenIds.current(),
            "Invalid credential ID"
        );
        _mint(receiver, credId, 1, "");
    }

    function getUserTokens(address user) external view returns (uint256[] memory userTokens) {
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
