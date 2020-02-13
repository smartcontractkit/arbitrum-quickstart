var OffchainExample = artifacts.require("./OffchainExample.sol");

module.exports = function(deployer, network) {
    deployer.deploy(OffchainExample);
};
