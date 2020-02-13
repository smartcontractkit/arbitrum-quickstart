const HDWalletProvider = require('truffle-hdwallet-provider')
const variables = require('./variables')

module.exports = {
  networks: {
    cldev: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
    },
    rinkeby: {
      provider: () => {
        return new HDWalletProvider(variables.MNEMONIC_OR_PRIVATE_KEY, variables.ETH_URL)
      },
      network_id: '4',
      // Necessary due to https://github.com/trufflesuite/truffle/issues/1971
      // Should be fixed in Truffle 5.0.17
      skipDryRun: true,
    },
    ropsten: {
      provider: () => {
        return new HDWalletProvider(variables.MNEMONIC_OR_PRIVATE_KEY, variables.ETH_URL)
      },
      network_id: '3',
      // Necessary due to https://github.com/trufflesuite/truffle/issues/1971
      // Should be fixed in Truffle 5.0.17
      skipDryRun: true,
    },
    kovan: {
      provider: () => {
        return new HDWalletProvider(variables.MNEMONIC_OR_PRIVATE_KEY, variables.ETH_URL)
      },
      network_id: '42',
      // Necessary due to https://github.com/trufflesuite/truffle/issues/1971
      // Should be fixed in Truffle 5.0.17
      skipDryRun: true,
    },
  },
  compilers: {
    solc: {
      version: '0.4.24',
    },
  },
}
