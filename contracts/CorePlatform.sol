// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./ArtistProfile.sol";
import "./Artwork.sol";
import "./Marketplace.sol";
import "./Governance.sol";
import "./Staking.sol";
import "./LiquidityPool.sol";
import "./ArtLoan.sol";
import "./TokenDistribution.sol";
import "./ChainlinkIntegration.sol";
import "./SocialInteractions.sol";

contract CorePlatform is Ownable, Pausable {
    ArtistProfile public artistProfile;
    Artwork public artwork;
    Marketplace public marketplace;
    Governance public governance;
    Staking public staking;
    LiquidityPool public liquidityPool;
    ArtLoan public artLoan;
    TokenDistribution public tokenDistribution;
    ChainlinkIntegration public chainlinkIntegration;
    SocialInteractions public socialInteractions;

    event ContractUpdated(string contractName, address newAddress);

    constructor(
        address _artistProfile,
        address _artwork,
        address _marketplace,
        address payable _governance,
        address _staking,
        address _liquidityPool,
        address _artLoan,
        address _tokenDistribution,
        address _chainlinkIntegration,
        address _socialInteractions
    ) {
        artistProfile = ArtistProfile(_artistProfile);
        artwork = Artwork(_artwork);
        marketplace = Marketplace(_marketplace);
        governance = Governance(_governance);
        staking = Staking(_staking);
        liquidityPool = LiquidityPool(_liquidityPool);
        artLoan = ArtLoan(_artLoan);
        tokenDistribution = TokenDistribution(_tokenDistribution);
        chainlinkIntegration = ChainlinkIntegration(_chainlinkIntegration);
        socialInteractions = SocialInteractions(_socialInteractions);
    }

    function updateArtistProfile(address _newAddress) external onlyOwner {
        artistProfile = ArtistProfile(_newAddress);
        emit ContractUpdated("ArtistProfile", _newAddress);
    }

    function updateArtwork(address _newAddress) external onlyOwner {
        artwork = Artwork(_newAddress);
        emit ContractUpdated("Artwork", _newAddress);
    }

    function updateMarketplace(address _newAddress) external onlyOwner {
        marketplace = Marketplace(_newAddress);
        emit ContractUpdated("Marketplace", _newAddress);
    }

    function updateGovernance(address payable _newAddress) external onlyOwner {
        governance = Governance(_newAddress);
        emit ContractUpdated("Governance", _newAddress);
    }

    function updateStaking(address _newAddress) external onlyOwner {
        staking = Staking(_newAddress);
        emit ContractUpdated("Staking", _newAddress);
    }

    function updateLiquidityPool(address _newAddress) external onlyOwner {
        liquidityPool = LiquidityPool(_newAddress);
        emit ContractUpdated("LiquidityPool", _newAddress);
    }

    function updateArtLoan(address _newAddress) external onlyOwner {
        artLoan = ArtLoan(_newAddress);
        emit ContractUpdated("ArtLoan", _newAddress);
    }

    function updateTokenDistribution(address _newAddress) external onlyOwner {
        tokenDistribution = TokenDistribution(_newAddress);
        emit ContractUpdated("TokenDistribution", _newAddress);
    }

    function updateChainlinkIntegration(address _newAddress) external onlyOwner {
        chainlinkIntegration = ChainlinkIntegration(_newAddress);
        emit ContractUpdated("ChainlinkIntegration", _newAddress);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Add any additional platform-wide functionality here
}