const Oracle = artifacts.require('Oracle')
const variables = require('../variables')

/*
   This script authorizes the Chainlink node to fulfill requests
   on the Oracle contract.
*/

const chainlinkNodeAddr = variables.CHAINLINK_NODE_ADDR

module.exports = async callback => {
  const oracle = await Oracle.deployed()
  console.log('Authorizing node', chainlinkNodeAddr, 'to fulfill requests on Oracle contract', oracle.address)
  const tx = await oracle.setFulfillmentPermission(chainlinkNodeAddr, true)
  callback(tx.tx)
}
