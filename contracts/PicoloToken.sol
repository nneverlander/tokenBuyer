pragma solidity 0.4.18;

import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

contract PicoloToken is StandardToken {
  using SafeMath for uint256;

  string public constant name = 'Picolo Token';
  string public constant symbol ='PIC';
  uint256 public constant decimals = 18;
  uint256 public constant tokenExchangeRate = 1000;
  uint256 public tokensSold = 0;
  uint256 exponent = 10**decimals;
  uint256 public tokensForSale = 1 * (10**9) * exponent;

  event LogTransfer(address indexed addr, uint256 _value);

  function PicoloToken() public {
    totalSupply_ = 10 * (10**9) * exponent; // 10 billion
    balances[msg.sender] = totalSupply_;
  }

  /// @dev Accepts ether and creates new PIC tokens.
  function contributeETH() payable external {
    require(msg.value > 0);

    uint256 tokens = (msg.value).mul(tokenExchangeRate);
    assert(tokens <= tokensForSale.sub(tokensSold));
    tokensSold = tokensSold.add(tokens);

    msg.sender.transfer(tokens);
    LogTransfer(msg.sender, tokens);
  }

  function getTokensSold() external constant returns (uint256) {
    return tokensSold;
  }

}
