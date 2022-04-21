/**
 * This is a fake API system (for quick frontend dev)
 * TODO: Replace with actual API system
 */

import configAPI from './config'
import shopAPI from './shop'

const SampleTokenCode = '// SPDX-License-Identifier: UNLICENSED\n'
  + 'pragma solidity ^0.8;\n'
  + '\n'
  + 'import "@openzeppelin/contracts/access/Ownable.sol";\n'
  + 'import "@openzeppelin/contracts/token/ERC20/ERC20.sol";\n'
  + 'import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";\n'
  + 'import "hardhat/console.sol";\n'
  + '\n'
  + '/**\n'
  + ' * Functions should be grouped according to their visibility and ordered:\n'
  + ' * constructor\n'
  + ' * receive function (if exists)\n'
  + ' * fallback function (if exists)\n'
  + ' * external\n'
  + ' * public\n'
  + ' * internal\n'
  + ' * private\n'
  + ' * (Within a grouping, place the view and pure functions last.)\n'
  + '*/\n'
  + '\n'
  + 'contract SampleToken is ERC20PresetMinterPauser, Ownable {\n'
  + '  constructor(\n'
  + '    string memory _name,\n'
  + '    string memory _symbol,\n'
  + '    uint256 _initialSupply\n'
  + '  ) ERC20PresetMinterPauser(_name, _symbol) {\n'
  + '    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);\n'
  + '    _mint(msg.sender, _initialSupply * 10 ** decimals());\n'
  + '    console.log("Contract constructor caller: %s", msg.sender);\n'
  + '  }\n'
  + '\n'
  + '  function decimals() public pure virtual override returns (uint8) {\n'
  + '    return 2;\n'
  + '  }\n'
  + '\n'
  + '  // automatically only allows accounts with DEFAULT_ADMIN_ROLE\n'
  + '  function addMinter(address _addr) public {\n'
  + '    grantRole(MINTER_ROLE, _addr);\n'
  + '  }\n'
  + '\n'
  + '  function removeMinter(address _addr) private {\n'
  + '    revokeRole(MINTER_ROLE, _addr);\n'
  + '  }\n'
  + '}\n'

/**
 * Returns contract code associated with the address; manually uploaded and verified on explorer
 * @param {string} address
 */
function getContractCode(address) {
  if (address === '0x2D994A833830E7A955b1e3f5eF28f988e93F84d6') {
    return SampleTokenCode
  }
  return ''
}

export {
  configAPI,
  shopAPI,
  getContractCode,
}
