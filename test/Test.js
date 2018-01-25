var PicoloToken = artifacts.require("PicoloToken");
var ICOBuyer = artifacts.require("ICOBuyer");
var saleContract;

contract('PicoloToken', function(accounts) {
  console.log(accounts);
  console.log(accounts.length, accounts[0], accounts[1]);
  var bal = 10 * (10 ** 9) * (10 ** 18);
  it("totalSupply_ should be 10 billion and assigned to the caller", function() {
    return PicoloToken.deployed().then(function(instance) {
      saleContract = instance;
      console.log(instance.address);
      return instance.balanceOf(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), bal, "10 billion wasn't in the first account");
    });
  });

  it("tokens sold should be zero", function() {
    return PicoloToken.deployed().then(function(instance) {
      console.log(instance.address);
      return instance.tokensSold.call();
    }).then(function(sold) {
      assert.equal(sold.valueOf(), 0, "tokens sold is not zero");
    });
  });

  var tokenExchangeRate;
  //hardcoding due to a bug in truffle
  var icoBuyer = ICOBuyer.at('0xf12b5dd4ead5f743c6baa640b0216200e89b60da');

  it("Eth, Token balance and contract value should be zero", function() {
    //var icoBuyer;
    return ICOBuyer.deployed().then(function(instance) {
      //icoBuyer = instance;
      return icoBuyer.getEthBalance();
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 0, "Eth balance is not 0");
    }).then(function() {
      return icoBuyer.getTokenBalance();
    }).then(function(tokenBalance) {
      assert.equal(tokenBalance.valueOf(), 0, "Token balance is not 0");
    }).then(function() {
      return icoBuyer.getContractValue();
    }).then(function(contractValue) {
      assert.equal(contractValue.valueOf(), 0, "Contract value is not 0");
    }).then(function() {
      return icoBuyer.getTokenExchangeRate();
    }).then(function(exchangeRate) {
      tokenExchangeRate = exchangeRate;
    });
  });

  it("Ether should be deposited correctly", function() {
    ICOBuyer.deployed().then(function(instance) {
      //send from account 0
      icoBuyer.send(web3.toWei(10, "ether")).then(function(result) {
        icoBuyer.getEthBalance().then(function(resp) {
          assert.equal(resp.valueOf(), web3.toWei(10, "ether"), "ether deposit not stored for account 1");
          icoBuyer.getTokenBalance().then(function(resp) {
            assert.equal(resp.valueOf(), 0, "token balance is not 0");
            icoBuyer.getContractValue().then(function(resp) {
              assert.equal(resp.valueOf(), web3.toWei(10, "ether") * tokenExchangeRate, "contract value does not match");
              //send from account 2
              // bug truffle undefined
              console.log('account 2: ' + accounts[2]);
              icoBuyer.send(web3.toWei(20, "ether"), {
                from: accounts[2]
              }).then(function(result) {
                icoBuyer.getEthBalance().then(function(resp) {
                  assert.equal(resp.valueOf(), web3.toWei(30, "ether"), "ether deposit not stored for account 2");
                  icoBuyer.getTokenBalance().then(function(resp) {
                    assert.equal(resp.valueOf(), 0, "token balance is not 0");
                    icoBuyer.getContractValue().then(function(resp) {
                      assert.equal(resp.valueOf(), web3.toWei(30, "ether") * tokenExchangeRate, "contract value does not match");
                      //before withdraw
                      icoBuyer.getMyBalance().then(function(resp) {
                        assert.equal(resp.valueOf(), web3.toWei(30, "ether"), "user balance not 30 before withdrawal");
                        //withdraw eth
                        icoBuyer.withdraw().then(function(result) {
                          icoBuyer.getMyBalance().then(function(resp) {
                            assert.equal(resp.valueOf(), 0, "user balance not 0 after withdrawal");
                            icoBuyer.getEthBalance().then(function(resp) {
                              assert.equal(resp.valueOf(), 0, "ether deposit not stored for account 1");
                              icoBuyer.getTokenBalance().then(function(resp) {
                                assert.equal(resp.valueOf(), 0, "token balance is not 0");
                                icoBuyer.getContractValue().then(function(resp) {
                                  assert.equal(resp.valueOf(), 0, "contract value does not match");
                                  //resend from account
                                  icoBuyer.send(web3.toWei(10, "ether")).then(function(result) {
                                    icoBuyer.getMyBalance().then(function(resp) {
                                      assert.equal(resp.valueOf(), web3.toWei(10, "ether"), "user balance not 10 after deposit");
                                      icoBuyer.getEthBalance().then(function(resp) {
                                        assert.equal(resp.valueOf(), web3.toWei(10, "ether"), "ether deposit not stored for account 1");
                                        icoBuyer.getTokenBalance().then(function(resp) {
                                          assert.equal(resp.valueOf(), 0, "token balance is not 0");
                                          icoBuyer.getContractValue().then(function(resp) {
                                            assert.equal(resp.valueOf(), web3.toWei(10, "ether") * tokenExchangeRate, "contract value does not match");
                                            //buy tokens
                                            icoBuyer.buy().then(function(result) {
                                              saleContract.getTokensSold().then(function(resp) {
                                                assert.equal(resp.valueOf(), web3.toWei(10, "ether") * tokenExchangeRate, "tokens sold does not match");
                                                icoBuyer.getEthBalance().then(function(resp) {
                                                  assert.equal(resp.valueOf(), 0, "ether balance not 0");
                                                  icoBuyer.getTokenBalance().then(function(resp) {
                                                    var tokenBal = resp.valueOf();
                                                    assert.equal(tokenBal, web3.toWei(10, "ether") * tokenExchangeRate, "token balance is 0");
                                                    icoBuyer.getContractValue().then(function(resp) {
                                                      assert.equal(resp.valueOf(), tokenBal, "contract value does not match");
                                                    });
                                                  });
                                                });
                                              });
                                            });
                                          });
                                        });
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
