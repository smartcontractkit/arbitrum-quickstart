const MyDataConsumer = artifacts.require('MyDataConsumer')
const LinkToken = artifacts.require('LinkToken')
const Oracle = artifacts.require('Oracle')

module.exports = (deployer, network) => {
  if (!['rinkeby', 'ropsten', 'kovan'].includes(network)) {
    // Local (development) networks need their own deployment of the LINK token
    deployer.deploy(LinkToken).then(() => {
      return deployer.deploy(Oracle, LinkToken.address).then(() => {
        return deployer.deploy(MyDataConsumer, LinkToken.address, Oracle.address)
      })
    })

  } else {
    const linkTokenAddrs = {
      rinkeby: '0x01be23585060835e02b77ef475b0cc51aa1e0709',
      ropsten: '0x20fE562d797A42Dcb3399062AE9546cd06f63280',
      kovan: '0xa36085F69e2889c224210F603D836748e7dC0088',
    }

    deployer.deploy(Oracle, linkTokenAddrs[network]).then(() => {
      return deployer.deploy(MyDataConsumer, linkTokenAddrs[network], Oracle.address)
    })
  }
}
