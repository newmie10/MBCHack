// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ForecastFollow
 * @dev A social graph contract for following forecasters on prediction markets
 * @notice Deployed on Base Sepolia for the Forecast Feed application
 */
contract ForecastFollow {
    // Mapping from follower to list of followed addresses
    mapping(address => address[]) private _following;
    
    // Mapping from forecaster to list of followers
    mapping(address => address[]) private _followers;
    
    // Mapping for quick lookup: follower => forecaster => isFollowing
    mapping(address => mapping(address => bool)) private _isFollowing;
    
    // Mapping for index lookup to enable removal
    mapping(address => mapping(address => uint256)) private _followingIndex;
    mapping(address => mapping(address => uint256)) private _followerIndex;

    event Followed(address indexed follower, address indexed forecaster);
    event Unfollowed(address indexed follower, address indexed forecaster);

    /**
     * @dev Follow a forecaster
     * @param forecaster The address of the forecaster to follow
     */
    function follow(address forecaster) external {
        require(forecaster != address(0), "Cannot follow zero address");
        require(forecaster != msg.sender, "Cannot follow yourself");
        require(!_isFollowing[msg.sender][forecaster], "Already following");

        // Add to following list
        _followingIndex[msg.sender][forecaster] = _following[msg.sender].length;
        _following[msg.sender].push(forecaster);

        // Add to followers list
        _followerIndex[forecaster][msg.sender] = _followers[forecaster].length;
        _followers[forecaster].push(msg.sender);

        // Mark as following
        _isFollowing[msg.sender][forecaster] = true;

        emit Followed(msg.sender, forecaster);
    }

    /**
     * @dev Unfollow a forecaster
     * @param forecaster The address of the forecaster to unfollow
     */
    function unfollow(address forecaster) external {
        require(_isFollowing[msg.sender][forecaster], "Not following");

        // Remove from following list (swap and pop)
        uint256 followingIdx = _followingIndex[msg.sender][forecaster];
        uint256 lastFollowingIdx = _following[msg.sender].length - 1;
        
        if (followingIdx != lastFollowingIdx) {
            address lastFollowing = _following[msg.sender][lastFollowingIdx];
            _following[msg.sender][followingIdx] = lastFollowing;
            _followingIndex[msg.sender][lastFollowing] = followingIdx;
        }
        _following[msg.sender].pop();
        delete _followingIndex[msg.sender][forecaster];

        // Remove from followers list (swap and pop)
        uint256 followerIdx = _followerIndex[forecaster][msg.sender];
        uint256 lastFollowerIdx = _followers[forecaster].length - 1;
        
        if (followerIdx != lastFollowerIdx) {
            address lastFollower = _followers[forecaster][lastFollowerIdx];
            _followers[forecaster][followerIdx] = lastFollower;
            _followerIndex[forecaster][lastFollower] = followerIdx;
        }
        _followers[forecaster].pop();
        delete _followerIndex[forecaster][msg.sender];

        // Mark as not following
        _isFollowing[msg.sender][forecaster] = false;

        emit Unfollowed(msg.sender, forecaster);
    }

    /**
     * @dev Get list of addresses a user is following
     * @param user The address to query
     * @return Array of followed addresses
     */
    function getFollowing(address user) external view returns (address[] memory) {
        return _following[user];
    }

    /**
     * @dev Get list of followers for a forecaster
     * @param forecaster The address to query
     * @return Array of follower addresses
     */
    function getFollowers(address forecaster) external view returns (address[] memory) {
        return _followers[forecaster];
    }

    /**
     * @dev Check if a user is following a forecaster
     * @param user The potential follower
     * @param forecaster The potential followed address
     * @return True if user is following forecaster
     */
    function isFollowing(address user, address forecaster) external view returns (bool) {
        return _isFollowing[user][forecaster];
    }

    /**
     * @dev Get the number of addresses a user is following
     * @param user The address to query
     * @return Number of followed addresses
     */
    function getFollowingCount(address user) external view returns (uint256) {
        return _following[user].length;
    }

    /**
     * @dev Get the number of followers for a forecaster
     * @param forecaster The address to query
     * @return Number of followers
     */
    function getFollowerCount(address forecaster) external view returns (uint256) {
        return _followers[forecaster].length;
    }
}
