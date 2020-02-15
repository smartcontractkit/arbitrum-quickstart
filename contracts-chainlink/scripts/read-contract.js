const MyDataConsumer = artifacts.require('MyDataConsumer')

/*
  This script makes it easy to read the data variable
  of the requesting contract.
*/

module.exports = async callback => {
  const mdc = await MyDataConsumer.deployed()
  const data = await mdc.data.call()
  callback('The result is: ' + data + '\n\n')
}
