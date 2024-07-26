// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract LiquidityPool is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    IERC20 public coreToken;
    IERC20 public artToken;

    uint256 public totalLiquidity;
    mapping(address => uint256) public userLiquidity;

    event LiquidityAdded(address indexed user, uint256 coreAmount, uint256 artAmount);
    event LiquidityRemoved(address indexed user, uint256 coreAmount, uint256 artAmount);
    event Swapped(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);

    constructor(address _coreToken, address _artToken) {
        coreToken = IERC20(_coreToken);
        artToken = IERC20(_artToken);
    }

    function addLiquidity(uint256 _coreAmount, uint256 _artAmount) external nonReentrant {
        require(_coreAmount > 0 && _artAmount > 0, "Amounts must be greater than 0");

        coreToken.safeTransferFrom(msg.sender, address(this), _coreAmount);
        artToken.safeTransferFrom(msg.sender, address(this), _artAmount);

        uint256 liquidity = totalLiquidity == 0 
            ? sqrt(_coreAmount.mul(_artAmount))
            : min(_coreAmount.mul(totalLiquidity) / coreToken.balanceOf(address(this)),
                  _artAmount.mul(totalLiquidity) / artToken.balanceOf(address(this)));

        totalLiquidity = totalLiquidity.add(liquidity);
        userLiquidity[msg.sender] = userLiquidity[msg.sender].add(liquidity);

        emit LiquidityAdded(msg.sender, _coreAmount, _artAmount);
    }

    function removeLiquidity(uint256 _liquidity) external nonReentrant {
        require(_liquidity > 0 && _liquidity <= userLiquidity[msg.sender], "Invalid liquidity amount");

        uint256 coreAmount = _liquidity.mul(coreToken.balanceOf(address(this))) / totalLiquidity;
        uint256 artAmount = _liquidity.mul(artToken.balanceOf(address(this))) / totalLiquidity;

        totalLiquidity = totalLiquidity.sub(_liquidity);
        userLiquidity[msg.sender] = userLiquidity[msg.sender].sub(_liquidity);

        coreToken.safeTransfer(msg.sender, coreAmount);
        artToken.safeTransfer(msg.sender, artAmount);

        emit LiquidityRemoved(msg.sender, coreAmount, artAmount);
    }

    function swap(address _tokenIn, uint256 _amountIn) external nonReentrant {
        require(_tokenIn == address(coreToken) || _tokenIn == address(artToken), "Invalid token");
        require(_amountIn > 0, "Amount must be greater than 0");

        IERC20 tokenIn = IERC20(_tokenIn);
        IERC20 tokenOut = _tokenIn == address(coreToken) ? artToken : coreToken;

        uint256 reserveIn = tokenIn.balanceOf(address(this));
        uint256 reserveOut = tokenOut.balanceOf(address(this));

        uint256 amountOut = getAmountOut(_amountIn, reserveIn, reserveOut);

        tokenIn.safeTransferFrom(msg.sender, address(this), _amountIn);
        tokenOut.safeTransfer(msg.sender, amountOut);

        emit Swapped(msg.sender, _tokenIn, address(tokenOut), _amountIn, amountOut);
    }

    function getAmountOut(uint256 _amountIn, uint256 _reserveIn, uint256 _reserveOut) public pure returns (uint256) {
        require(_amountIn > 0, "Insufficient input amount");
        require(_reserveIn > 0 && _reserveOut > 0, "Insufficient liquidity");

        uint256 amountInWithFee = _amountIn.mul(997);
        uint256 numerator = amountInWithFee.mul(_reserveOut);
        uint256 denominator = _reserveIn.mul(1000).add(amountInWithFee);
        return numerator / denominator;
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}