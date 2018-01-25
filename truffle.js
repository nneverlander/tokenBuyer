const HDWalletProvider = require("truffle-hdwallet-provider");
const development_mnemonic = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat';

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/");
      },
      network_id: '3',
    },
    development: {
      provider: function() {
        return new HDWalletProvider(development_mnemonic, "http://127.0.0.1:7545/");
      },
      network_id: '*',
    }
  }
};
