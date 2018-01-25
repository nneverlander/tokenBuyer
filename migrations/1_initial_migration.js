var PicoloToken = artifacts.require("PicoloToken");
var ICOBuyer = artifacts.require("ICOBuyer");

module.exports = function(deployer) {
  deployer.deploy(PicoloToken).then(function() {
    deployer.deploy(ICOBuyer, PicoloToken.address, PicoloToken.address);
  });
};
