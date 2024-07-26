// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ArtLoan is ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    struct Loan {
        address borrower;
        uint256 amount;
        uint256 dueDate;
        bool repaid;
        bool liquidated;
    }

    IERC20 public coreToken;
    IERC721 public nftContract;

    mapping(uint256 => Loan) public loans;
    uint256 public interestRate; // Annual interest rate in basis points (1% = 100)
    uint256 public loanDuration; // Loan duration in seconds

    event LoanCreated(address indexed borrower, uint256 indexed tokenId, uint256 amount);
    event LoanRepaid(address indexed borrower, uint256 indexed tokenId, uint256 amount);
    event LoanLiquidated(address indexed borrower, uint256 indexed tokenId);

    constructor(address _coreToken, address _nftContract, uint256 _interestRate, uint256 _loanDuration) {
        coreToken = IERC20(_coreToken);
        nftContract = IERC721(_nftContract);
        interestRate = _interestRate;
        loanDuration = _loanDuration;
    }

    function createLoan(uint256 _tokenId, uint256 _amount) external nonReentrant {
        require(nftContract.ownerOf(_tokenId) == msg.sender, "Not the owner of the NFT");
        require(loans[_tokenId].amount == 0, "Loan already exists for this NFT");

        nftContract.transferFrom(msg.sender, address(this), _tokenId);
        coreToken.transfer(msg.sender, _amount);

        loans[_tokenId] = Loan({
            borrower: msg.sender,
            amount: _amount,
            dueDate: block.timestamp.add(loanDuration),
            repaid: false,
            liquidated: false
        });

        emit LoanCreated(msg.sender, _tokenId, _amount);
    }

    function repayLoan(uint256 _tokenId) external nonReentrant {
        Loan storage loan = loans[_tokenId];
        require(loan.borrower == msg.sender, "Not the borrower");
        require(!loan.repaid && !loan.liquidated, "Loan already repaid or liquidated");

        uint256 interest = calculateInterest(loan.amount, loan.dueDate);
        uint256 totalRepayment = loan.amount.add(interest);

        coreToken.transferFrom(msg.sender, address(this), totalRepayment);
        nftContract.transferFrom(address(this), msg.sender, _tokenId);

        loan.repaid = true;

        emit LoanRepaid(msg.sender, _tokenId, totalRepayment);
    }

    function liquidateLoan(uint256 _tokenId) external nonReentrant onlyOwner {
        Loan storage loan = loans[_tokenId];
        require(!loan.repaid && !loan.liquidated, "Loan already repaid or liquidated");
        require(block.timestamp > loan.dueDate, "Loan not yet due");

        nftContract.transferFrom(address(this), owner(), _tokenId);
        loan.liquidated = true;

        emit LoanLiquidated(loan.borrower, _tokenId);
    }

    function calculateInterest(uint256 _amount, uint256 _dueDate) public view returns (uint256) {
        uint256 timeElapsed = block.timestamp > _dueDate ? _dueDate.sub(block.timestamp) : 0;
        return _amount.mul(interestRate).mul(timeElapsed).div(365 days).div(10000);
    }

    function setInterestRate(uint256 _newRate) external onlyOwner {
        interestRate = _newRate;
    }

    function setLoanDuration(uint256 _newDuration) external onlyOwner {
        loanDuration = _newDuration;
    }
}