const MyDataConsumer = artifacts.require('MyDataConsumer')
const variables = require('../variables')

/*
  This script issues a Chainlink request from MyDataConsumer
  to the Chainlink node via the node's Oracle contract.
*/

const jobId = variables.JOB_ID
const payment = variables.LINK_PAYMENT

module.exports = async (callback) => {
  const mdc = await MyDataConsumer.deployed()
  console.log('Creating request on contract:', mdc.address)
  const tx = await mdc.createRequest(web3.utils.toHex(jobId), payment)
  callback(tx.tx)
}
