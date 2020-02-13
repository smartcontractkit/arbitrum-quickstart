const variables = require('../variables')

/*
   This script authorizes the Chainlink node to fulfill requests
   on the Oracle contract.
*/

const chainlinkNodeAddr = variables.CHAINLINK_NODE_ADDR

module.exports = async callback => {
  const accounts = await web3.eth.getAccounts()
  console.log('Sending Chainlink node', chainlinkNodeAddr, '0.3 ETH from', accounts[0])
  const tx = await web3.eth.sendTransaction({ from: accounts[0], to: chainlinkNodeAddr, value: web3.utils.toWei('0.3', 'ether') })
  callback(tx.tx)
}

