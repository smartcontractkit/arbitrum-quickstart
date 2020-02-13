const MyDataConsumer = artifacts.require('MyDataConsumer')
const LinkToken = artifacts.require('LinkToken')
const variables = require('../variables')

/*
  This script is meant to assist with funding the requesting
  contract with LINK. It will send 1 LINK to the requesting
  contract for ease-of-use. Any extra LINK present on the contract
  can be retrieved by calling the withdrawLink() function.
*/

const payment = '5000000000000000000'

module.exports = async callback => {
  const mdc = await MyDataConsumer.deployed()
  const tokenAddress = await mdc.getChainlinkToken()
  const token = await LinkToken.at(tokenAddress)
  console.log('Funding contract:', mdc.address)
  const tx = await token.transfer(mdc.address, payment)
  callback(tx.tx)
}
