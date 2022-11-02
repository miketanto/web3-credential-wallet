// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.6;

import "../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";

contract ERC1155NFT is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;
    mapping(uint256 => string) private _hashes;
    string private _uri;

    constructor(address marketplaceAddress, string memory initUri) ERC1155(""){
        contractAddress = marketplaceAddress;
        _uri = initUri;
    }

     function uri(uint256 id) public view virtual override returns (string memory) {
        return string(abi.encodePacked(_uri, _hashes[id]));
    }

    function createToken(uint256 amount, string memory hash) public returns (uint) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId, amount,"");
        _hashes[newItemId] = hash;
        setApprovalForAll(contractAddress, true);
        return newItemId;
    }
    
}