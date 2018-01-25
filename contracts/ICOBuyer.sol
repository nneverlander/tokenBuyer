pragma solidity 0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol';

/*

Syndicate/whitelist ico buyer
Buys tokens from the crowdsale on your behalf.
Author: /u/quaintday
Inspired from a similar contract by /u/Cintix

*/
// Interface to ICO Contract
contract PicoloToken {
  function contributeETH() external payable;
}

contract ICOBuyer {

  using SafeMath for uint256;
  // Store the amount of ETH deposited or BNT owned by each account.
  mapping (address => uint) public balances;
  // Track whether the contract has bought the tokens yet.
  bool public bought_tokens;
  address owner;

  // The Token Sale address.
  PicoloToken public sale;
  // Token Contract address.
  ERC20Basic public token;
  // The developer address.
  address developer = 0x3137961C4C5f3378A2CAA722Ddcf82c2478AF27d;
  uint256 multiple = 1000;

  // events
  event LogWithdrawal(address indexed addr, uint256 _value);
  event LogBuy(address indexed addr, uint256 _value);
  event LogTransferEth(address indexed addr, uint256 _value);
  event LogTransferTokens(address indexed addr, uint256 _value);

  function ICOBuyer(address saleAddr, address tokenAddress) public {
      owner = msg.sender;
      sale = PicoloToken(saleAddr);
      token = ERC20Basic(tokenAddress);
  }

  modifier onlyOwner {
      require(msg.sender == owner);
      _;
  }

  // Withdraws all ETH deposited by the sender.
  // Called to cancel a user's participation in the sale.
  function withdraw() external {
    // Store the user's balance prior to withdrawal in a temporary variable.
    uint amount = balances[msg.sender];
    // Update the user's balance prior to sending ETH to prevent recursive call.
    balances[msg.sender] = 0;
    // Return the user's funds.  Throws on failure to prevent loss of funds.
    msg.sender.transfer(amount);
    LogWithdrawal(msg.sender, amount);
  }

  // Buys tokens in the crowdsale.
  function buy() external onlyOwner {
    // Short circuit to save gas if the contract has already bought tokens.
    if (bought_tokens) return;
    // Record that the contract has bought the tokens.
    bought_tokens = true;
    // Transfer all the funds to the crowdsale contract to buy tokens.
    sale.contributeETH.value(this.balance)();
    LogBuy(msg.sender, this.balance);
  }

  // A helper function for the default function, allowing contracts to interact.
  function default_helper() public payable {
    // Only allow deposits if the contract hasn't already purchased the tokens.
    if (!bought_tokens) {
      // Update records of deposited ETH to include the received amount.
      balances[msg.sender] = balances[msg.sender].add(msg.value);
    }
    // Withdraw the sender's tokens if the contract has already purchased them.
    else {
        // Don't accept ETH after the sale is concluded
        require(msg.value == 0);
        // Store the user's balance prior to withdrawal in a temporary variable.
        uint256 user_balance = balances[msg.sender];
        // Update the user's balance prior to sending ETH to prevent recursive call.
        balances[msg.sender] = 0;
        // Retrieve current ETH balance of contract (less the bounty).
        uint256 contract_eth_balance = this.balance;
        // Retrieve current token balance of contract.
        uint256 contract_token_balance = token.balanceOf(address(this));
        // Calculate total token value of ETH and tokens owned by the contract.
        // 1 ETH Wei -> multiple token Wei
        uint256 contract_value = (contract_eth_balance.mul(multiple)).add(contract_token_balance);
        // Calculate amount of ETH to withdraw.
        uint256 eth_amount = (user_balance.mul(contract_eth_balance).mul(multiple)).div(contract_value);
        // Calculate amount of tokens to withdraw.
        uint256 token_amount = (user_balance.mul(contract_token_balance).mul(multiple)).div(contract_value);

        // Send the funds
        require(token.transfer(msg.sender, token_amount));
        LogTransferTokens(msg.sender, token_amount);
        msg.sender.transfer(eth_amount);
        LogTransferEth(msg.sender, eth_amount);
    }
  }

  function getEthBalance() public constant returns (uint256) {
    return this.balance;
  }

  function getMyBalance() external constant returns (uint256) {
    return balances[msg.sender];
  }

  function getTokenBalance() public constant returns (uint256) {
    return token.balanceOf(address(this));
  }

  function getContractValue() external constant returns (uint256) {
    return (this.getEthBalance().mul(multiple)).add(this.getTokenBalance());
  }

  function getTokenExchangeRate() external constant returns (uint256) {
    return multiple;
  }

  function () external payable {
     // Avoid recursively buying tokens when the sale contract refunds ETH.
    if (msg.sender == address(sale)) return;
    // Delegate to the helper function.
    default_helper();
  }
}
