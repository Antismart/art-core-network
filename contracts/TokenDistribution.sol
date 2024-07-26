// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract TokenDistribution is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    IERC20 public coreToken;
    
    uint256 public constant DISTRIBUTION_PERIOD = 30 days;
    uint256 public constant TOTAL_DISTRIBUTION_PERIODS = 12;

    uint256 public startTime;
    uint256 public totalAllocated;
    uint256 public totalDistributed;
    uint256 public currentPeriod;

    mapping(address => bool) public isEligible;
    mapping(address => uint256) public userAllocations;
    mapping(address => mapping(uint256 => bool)) public hasClaimed;

    event EligibilitySet(address indexed user, bool isEligible);
    event AllocationSet(address indexed user, uint256 amount);
    event TokensClaimed(address indexed user, uint256 amount, uint256 period);

    constructor(address _coreToken) {
        coreToken = IERC20(_coreToken);
        startTime = block.timestamp;
        currentPeriod = 1;
    }

    function setEligibility(address[] calldata _users, bool[] calldata _eligibility) external onlyOwner {
        require(_users.length == _eligibility.length, "Arrays length mismatch");
        for (uint256 i = 0; i < _users.length; i++) {
            isEligible[_users[i]] = _eligibility[i];
            emit EligibilitySet(_users[i], _eligibility[i]);
        }
    }

    function setAllocations(address[] calldata _users, uint256[] calldata _amounts) external onlyOwner {
        require(_users.length == _amounts.length, "Arrays length mismatch");
        for (uint256 i = 0; i < _users.length; i++) {
            require(isEligible[_users[i]], "User not eligible");
            userAllocations[_users[i]] = _amounts[i];
            totalAllocated = totalAllocated.add(_amounts[i]);
            emit AllocationSet(_users[i], _amounts[i]);
        }
    }

    function claimTokens() external nonReentrant {
        require(isEligible[msg.sender], "Not eligible for distribution");
        require(userAllocations[msg.sender] > 0, "No allocation for user");

        uint256 claimablePeriods = (block.timestamp.sub(startTime)).div(DISTRIBUTION_PERIOD);
        require(claimablePeriods > 0, "No periods available for claiming");

        uint256 totalClaimable = 0;
        for (uint256 i = currentPeriod; i <= claimablePeriods && i <= TOTAL_DISTRIBUTION_PERIODS; i++) {
            if (!hasClaimed[msg.sender][i]) {
                uint256 periodAmount = userAllocations[msg.sender].div(TOTAL_DISTRIBUTION_PERIODS);
                totalClaimable = totalClaimable.add(periodAmount);
                hasClaimed[msg.sender][i] = true;
            }
        }

        require(totalClaimable > 0, "No tokens to claim");
        require(coreToken.balanceOf(address(this)) >= totalClaimable, "Insufficient contract balance");

        totalDistributed = totalDistributed.add(totalClaimable);
        coreToken.transfer(msg.sender, totalClaimable);

        emit TokensClaimed(msg.sender, totalClaimable, claimablePeriods);

        currentPeriod = claimablePeriods.add(1) > TOTAL_DISTRIBUTION_PERIODS ? TOTAL_DISTRIBUTION_PERIODS : claimablePeriods.add(1);
    }

    function withdrawRemainingTokens() external onlyOwner {
        require(block.timestamp > startTime.add(DISTRIBUTION_PERIOD.mul(TOTAL_DISTRIBUTION_PERIODS)), "Distribution period not ended");
        uint256 remainingBalance = coreToken.balanceOf(address(this));
        coreToken.transfer(owner(), remainingBalance);
    }
}