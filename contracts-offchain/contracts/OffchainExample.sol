pragma solidity ^0.5.0;

contract OffchainExample {
    event Result(uint x);

    function getSmallTransactionCount(uint transaction_count, uint large_transaction_count) public {
        // For the Chainlink-Arbitrum bridge to capture results from this off-chain
        // computation, they must be emitted in an event.  The bridge takes the value
        // from the first emitted event only.
        emit Result(transaction_count - large_transaction_count);
    }
}

