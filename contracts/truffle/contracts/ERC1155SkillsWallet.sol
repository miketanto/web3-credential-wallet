pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ERC721URIStorage is used to store the IPFS links in the token URI
// ERC721Enumerable is used to enumerate over all credentials a learner owns
contract SkillsWallet is ERC1155,ERC1155Burnable, Ownable  { 

    using Counters for Counters.Counter; 
    Counters.Counter private _tokenIds;
    uint256[] _tokenIdArray; //For easy balance of Batch use
    //Accounts that can mint new credentials
     mapping(address => bool) private credentialers;
    uint256 private credentialerCount;
    //Hashes for IPFS location of Skills metadata
    mapping(uint256 => string) private _hashes;
    string private _uri;

    constructor(string memory initUri, address initialCredentialer) ERC1155(""){
        credentialers[initialCredentialer] = true;
        _uri = initUri;
    }

    //Modifiers

    modifier onlyCredentialer(){
        require(credentialers[msg.sender]==true, "Not a approved credential creator");
        _;
    }

    //Override functions
     function uri(uint256 id) public view virtual override returns (string memory) {
        return string(abi.encodePacked(_uri, _hashes[id]));
    }

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

    //Contract Functions

    function createCredential(uint256 amount, string memory hash) public onlyCredentialer returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _tokenIdArray.push(newItemId);
        //Mint a credential
        _mint(msg.sender, newItemId, amount,"");
        _hashes[newItemId] = hash;
        return newItemId;
    }

    function addCredentialer(address credentialer) onlyCredentialer public {
        // New credentialer is now authorized to call smart contract functions
        credentialers[credentialer] = true;
        credentialerCount++;
    }

    function removeCredentialer(address credentialer) onlyCredentialer public {
        // Credentialer is no longer authorized to call smart contract functions
        credentialers[credentialer] = false;
        credentialerCount--;
    }

    function getCredentialerCount() public view returns(uint256) {
        return credentialerCount;
    }

    function fetchUserTokens(address _user) external view returns(uint256[] memory ownerTokens) {
        // Get number of credentials owned by a learner
        uint256 currentTokenId = _tokenIds.current();
        uint256[] memory result = new uint256[](currentTokenId);
        address[] memory accountArray = new address[](currentTokenId);
        for(uint256 i = 0;i<currentTokenId;i++){
            accountArray[i]=_user;
        }
        result = balanceOfBatch(accountArray,_tokenIdArray);
        return result;
    }
}