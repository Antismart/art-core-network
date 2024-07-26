// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ChainlinkIntegration is VRFConsumerBase, Ownable {
    AggregatorV3Interface internal priceFeed;
    bytes32 internal keyHash;
    uint256 internal fee;

    uint256 public randomResult;
    mapping(bytes32 => address) public requestIdToSender;

    event RequestedRandomness(bytes32 indexed requestId);
    event ReceivedRandomness(bytes32 indexed requestId, uint256 randomness);

    constructor(
        address _priceFeed,
        address _vrfCoordinator,
        address _link,
        bytes32 _keyHash,
        uint256 _fee
    ) VRFConsumerBase(_vrfCoordinator, _link) {
        priceFeed = AggregatorV3Interface(_priceFeed);
        keyHash = _keyHash;
        fee = _fee;
    }

    function getLatestPrice() public view returns (int) {
        (
            uint80 roundID,
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return price;
    }

    function requestRandomness() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
        requestId = requestRandomness(keyHash, fee);
        requestIdToSender[requestId] = msg.sender;
        emit RequestedRandomness(requestId);
        return requestId;
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness;
        emit ReceivedRandomness(requestId, randomness);
    }

    function withdrawLink() public onlyOwner {
        LINK.transfer(owner(), LINK.balanceOf(address(this)));
    }

    function setKeyHash(bytes32 _keyHash) public onlyOwner {
        keyHash = _keyHash;
    }

    function setFee(uint256 _fee) public onlyOwner {
        fee = _fee;
    }
}