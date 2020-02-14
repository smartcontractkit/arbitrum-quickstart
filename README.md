

# Chainlink + Arbitrum: off-chain computation development guide

## Prerequisites

- Docker
- docker-compose
- Node.js (10.x.x or higher)

## Quick start


1. Deploy the on-chain Chainlink contracts:
    - Navigate to the `contracts-chainlink` directory
    - Run `npm install`
    - Open `variables.js` and add the following values:
        - `MNEMONIC_OR_PRIVATE_KEY` for the Ethereum account you'll be using
        - `ETH_URL` for the Ethereum node you'll be communicating with
    - Deploy the contracts: `truffle migrate --network rinkeby`
    - Write down the Oracle contract's deployed address -- you'll need it in the next step.

2. Open `env.bridge-adapter`, `env.arbitrum-validator`, and `env.chainlink-node`, and follow the instructions, adding
values for `ETH_URL`, `PRIVATE_KEY`, etc.  Make sure to add the `ORACLE_CONTRACT_ADDRESS` value
that you received when you deployed the Chainlink Oracle contract.

3. Ensure that the address controlled by the private key you choose has some Ether.

4. Run `docker-compose up` from the repository root.  The Chainlink node and the bridge adapter will
spin up fairly quickly.  The Arbitrum validator service will take longer, because each time it starts,
it recompiles the off-chain contract, deploys it to the validator, and also deploys a new on-chain
rollup contract to track the off-chain computation results.  You will know that the validator is
ready when it begins to emit logs such as the following:
    ```
    validator_1        | 2020/02/12 22:53:54
    validator_1        | == nodes:
    validator_1        | ==   0:4c2ced leaf latestConfirmed
    validator_1        | == stakers:
    ```


5. Find the Chainlink node's Ethereum address in the log output.
    - Open `contracts-chainlink/variables.js` and set the `CHAINLINK_NODE_ADDR` variable.
    - Run `truffle exec scripts/fund-node.js`.
    - Run `truffle exec scripts/authorize-node.js`.

6. Open the Chainlink Operator UI at <http://localhost:6688> and log in.
    - **Username:** notreal@fakeemail.ch
    - **Password:** twochains

4. Click the "Bridges" link in the top menu.  Configure a new bridge with the following values:
    - **Bridge name:** arbitrum
    - **Bridge URL:** http://bridge-adapter:8080
    - **Default confirmations:** 0
    - **Minimum contract payment:** 0

5. Click the "Jobs" link in the top menu.  Configure a new job using a job spec like the following: 

    ```javascript
    {
        // The runlog initiator tells the Chainlink node to watch its Oracle contract for a log event telling
        // it to start a data request.
        "initiators": [{ "type": "runlog", "params": {} }],

        "tasks": [
            // The httpGet task fetches some data from the CryptoCompare API that will be used as the arguments
            // to the "getSmallTransactionCount" function in the contract deployed to the Arbitrum validator.
            // The data looks like this (extraneous fields omitted for clarity):
            // {
            //     "Data": {
            //         "Data": [
            //             {
            //                 "transaction_count": 12345,
            //                 "large_transaction_count": 678
            //             }
            //         ]
            //     }
            // }
            { "type": "httpGet", "params": { "url": "https://min-api.cryptocompare.com/data/blockchain/histo/day?fsym=BTC&api_key=<CryptoCompare API key>" } },

            // The jsonParse task parses the JSON and returns the contents of the given keypath.
            { "type": "jsonParse", "params": { "path": ["Data", "Data", "0"] } },

            // The ethTxAbiEncode task expects a JSON object, the entries of which are interpreted as arguments
            // to the function that is to be called.  It outputs hex-encoded calldata which, if submitted as a
            // regular Ethereum transaction, would call that function with those arguments.
            {
                "type": "ethTxAbiEncode",
                "params": {
                    "functionABI": {
                        "name": "getSmallTransactionCount",
                        "inputs": [
                            { "name": "transaction_count", "type": "uint256" },
                            { "name": "large_transaction_count", "type": "uint256" }
                        ]
                    }
                 }
            },

            // The arbitrum task (which is a user-defined "bridge" that needs to be manually configured in the
            // Chainlink Operator UI) expects hex-encoded calldata.  Instead of submitting that calldata as a
            // regular Ethereum transaction, it sends the calldata to an Arbitrum validator node over RPC,
            // which initiates the off-chain computation.  When the computation is complete, this task returns
            // a hex string containing the ABI-encoded result.
            //
            // The `contractAddress` parameter should be the address of the off-chain contract.  It is emitted
            // to the console when the Arbitrum validator Docker container is started and the Truffle migration
            // runs.  The address is deterministic, so unless you decide to deploy multiple interacting
            // off-chain contracts, the address given in this example should always suffice.
            { "type": "arbitrum", "params": { "contractAddress": "0x895521964D724c8362A36608AAf09A3D7d0A0445" } },

            // The ethTx task sends the result of the Arbitrum computation back to the Chainlink node's Oracle
            // contract, which then forwards it to the contract that made the original request.
            { "type": "ethTx" }
        ]
    }
    ```

    Once you create the job, it will be assigned a Job ID (a hex string).  Take this ID, open `contracts-chainlink/variables.js`,
    and set the `JOB_ID` variable.


## Development workflow

### On-chain data requester contract

This contract is located at `./contracts-chainlink/contracts/MyDataConsumer.sol`.  The
main reason to modify it is to alter how the contract stores data (does it aggregate results over
time?  does it need a different variable type?).  Don't forget to redeploy this contract if you make modifications.

### Off-chain contracts and migrations

These are located in `./contracts-offchain`.  After making changes to them,
you will need to restart the Dockerized Arbitrum validator service.  When you do this, the new code is compiled to
Arbitrum bytecode and deployed to the validator, and a new on-chain rollup contract is deployed to track the
off-chain computation results.

If you change the name or arguments of the off-chain function you're calling, you will also have to update the Chainlink
job spec (see next section).

### The job spec

If you make changes to the job spec, you will need to create a new job in the Chainlink Operator UI (<http://localhost:6688>).
Then, take the job ID of the new job, open `contracts-chainlink/variables.js`, and set the `JOB_ID` variable.

### Making a data request

Before you make any data requests, you have to send some LINK tokens to the on-chain `MyDataConsumer` contract.
Acquire some LINK at one of our testnet faucets (see <https://docs.chain.link/docs/testnet-oracles>), and then
run the following commands:

```sh
cd contracts-chainlink
truffle exec ./scripts/fund-contract.js
```

Once that transaction is mined, you can use another helper script to issue requests to the Chainlink oracle node:

```sh
cd contracts-chainlink
truffle exec ./scripts/request-data.js
```

Once the Chainlink node completes the job, it will send a transaction back to the `MyDataConsumer` contract with
the response.  To read that response, you can run the final helper script:

```sh
cd contracts-chainlink
truffle exec ./scripts/read-contract.js
```



