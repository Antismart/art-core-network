// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ArtistProfile is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    struct Profile {
        string name;
        string bio;
        address walletAddress;
        uint256 followerCount;
        uint256 followingCount;
        bool isVerified;
    }

    Counters.Counter private _profileIds;
    mapping(uint256 => address) public profileIdToAddress;
    mapping(address => uint256) public addressToProfileId;
    mapping(uint256 => Profile) public profiles;
    mapping(address => mapping(address => bool)) public isFollowing;

    event ProfileCreated(uint256 indexed profileId, address indexed artist);
    event ProfileUpdated(uint256 indexed profileId, address indexed artist);
    event Followed(address indexed follower, address indexed followed);
    event Unfollowed(address indexed follower, address indexed unfollowed);
    event ProfileVerified(uint256 indexed profileId, address indexed artist);

    modifier profileExists(address _address) {
        require(addressToProfileId[_address] != 0, "Profile does not exist");
        _;
    }

    function createProfile(string memory _name, string memory _bio) public nonReentrant {
        require(addressToProfileId[msg.sender] == 0, "Profile already exists");
        
        _profileIds.increment();
        uint256 newProfileId = _profileIds.current();

        profiles[newProfileId] = Profile(_name, _bio, msg.sender, 0, 0, false);
        profileIdToAddress[newProfileId] = msg.sender;
        addressToProfileId[msg.sender] = newProfileId;

        emit ProfileCreated(newProfileId, msg.sender);
    }

    function updateProfile(string memory _name, string memory _bio) public profileExists(msg.sender) {
        uint256 profileId = addressToProfileId[msg.sender];
        profiles[profileId].name = _name;
        profiles[profileId].bio = _bio;
        emit ProfileUpdated(profileId, msg.sender);
    }

    function updateArtistProfile(address _artist, string memory _name, string memory _bio) public onlyOwner profileExists(_artist) {
        uint256 profileId = addressToProfileId[_artist];
        profiles[profileId].name = _name;
        profiles[profileId].bio = _bio;
        emit ProfileUpdated(profileId, _artist);
    }

    function followArtist(address _artist) public profileExists(msg.sender) profileExists(_artist) {
        require(msg.sender != _artist, "Cannot follow yourself");
        require(!isFollowing[msg.sender][_artist], "Already following");

        uint256 followerProfileId = addressToProfileId[msg.sender];
        uint256 followedProfileId = addressToProfileId[_artist];

        isFollowing[msg.sender][_artist] = true;
        profiles[followerProfileId].followingCount++;
        profiles[followedProfileId].followerCount++;

        emit Followed(msg.sender, _artist);
    }

    function getArtistProfile(address _artist) public view returns (Profile memory) {
        uint256 profileId = addressToProfileId[_artist];
        require(profileId != 0, "Profile does not exist");
        return profiles[profileId];
    }

    function unfollowArtist(address _artistToUnfollow) public profileExists(msg.sender) profileExists(_artistToUnfollow) {
        require(isFollowing[msg.sender][_artistToUnfollow], "Not following");

        uint256 followerProfileId = addressToProfileId[msg.sender];
        uint256 unfollowedProfileId = addressToProfileId[_artistToUnfollow];

        isFollowing[msg.sender][_artistToUnfollow] = false;
        profiles[followerProfileId].followingCount--;
        profiles[unfollowedProfileId].followerCount--;

        emit Unfollowed(msg.sender, _artistToUnfollow);
    }

    function verifyProfile(uint256 _profileId) public onlyOwner {
        require(profileIdToAddress[_profileId] != address(0), "Profile does not exist");
        profiles[_profileId].isVerified = true;
        emit ProfileVerified(_profileId, profileIdToAddress[_profileId]);
    }

    function getProfile(address _address) public view returns (Profile memory) {
        uint256 profileId = addressToProfileId[_address];
        require(profileId != 0, "Profile does not exist");
        return profiles[profileId];
    }
}
