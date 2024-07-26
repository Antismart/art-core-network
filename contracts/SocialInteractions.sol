// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SocialInteractions is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    struct Comment {
        address author;
        uint256 timestamp;
        string content;
        uint256 likes;
    }

    struct Post {
        address author;
        uint256 timestamp;
        string content;
        uint256 likes;
        uint256 commentCount;
    }

    Counters.Counter private _postIds;
    mapping(uint256 => Post) public posts;
    mapping(uint256 => mapping(uint256 => Comment)) public comments;
    mapping(uint256 => mapping(address => bool)) public postLikes;
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public commentLikes;

    event PostCreated(uint256 indexed postId, address indexed author, string content);
    event PostLiked(uint256 indexed postId, address indexed liker);
    event PostUnliked(uint256 indexed postId, address indexed unliker);
    event CommentAdded(uint256 indexed postId, uint256 indexed commentId, address indexed author, string content);
    event CommentLiked(uint256 indexed postId, uint256 indexed commentId, address indexed liker);
    event CommentUnliked(uint256 indexed postId, uint256 indexed commentId, address indexed unliker);

    function createPost(string memory _content) external nonReentrant {
        require(bytes(_content).length > 0, "Content cannot be empty");
        require(bytes(_content).length <= 1000, "Content too long");

        _postIds.increment();
        uint256 newPostId = _postIds.current();

        posts[newPostId] = Post({
            author: msg.sender,
            timestamp: block.timestamp,
            content: _content,
            likes: 0,
            commentCount: 0
        });

        emit PostCreated(newPostId, msg.sender, _content);
    }

    function likePost(uint256 _postId) external nonReentrant {
        require(_postId > 0 && _postId <= _postIds.current(), "Invalid post ID");
        require(!postLikes[_postId][msg.sender], "Already liked");

        Post storage post = posts[_postId];
        post.likes++;
        postLikes[_postId][msg.sender] = true;

        emit PostLiked(_postId, msg.sender);
    }

    function unlikePost(uint256 _postId) external nonReentrant {
        require(_postId > 0 && _postId <= _postIds.current(), "Invalid post ID");
        require(postLikes[_postId][msg.sender], "Not liked");

        Post storage post = posts[_postId];
        post.likes--;
        postLikes[_postId][msg.sender] = false;

        emit PostUnliked(_postId, msg.sender);
    }

    function addComment(uint256 _postId, string memory _content) external nonReentrant {
        require(_postId > 0 && _postId <= _postIds.current(), "Invalid post ID");
        require(bytes(_content).length > 0, "Content cannot be empty");
        require(bytes(_content).length <= 500, "Content too long");

        Post storage post = posts[_postId];
        post.commentCount++;
        uint256 commentId = post.commentCount;

        comments[_postId][commentId] = Comment({
            author: msg.sender,
            timestamp: block.timestamp,
            content: _content,
            likes: 0
        });

        emit CommentAdded(_postId, commentId, msg.sender, _content);
    }

    function likeComment(uint256 _postId, uint256 _commentId) external nonReentrant {
        require(_postId > 0 && _postId <= _postIds.current(), "Invalid post ID");
        require(_commentId > 0 && _commentId <= posts[_postId].commentCount, "Invalid comment ID");
        require(!commentLikes[_postId][_commentId][msg.sender], "Already liked");

        Comment storage comment = comments[_postId][_commentId];
        comment.likes++;
        commentLikes[_postId][_commentId][msg.sender] = true;

        emit CommentLiked(_postId, _commentId, msg.sender);
    }

    function unlikeComment(uint256 _postId, uint256 _commentId) external nonReentrant {
        require(_postId > 0 && _postId <= _postIds.current(), "Invalid post ID");
        require(_commentId > 0 && _commentId <= posts[_postId].commentCount, "Invalid comment ID");
        require(commentLikes[_postId][_commentId][msg.sender], "Not liked");

        Comment storage comment = comments[_postId][_commentId];
        comment.likes--;
        commentLikes[_postId][_commentId][msg.sender] = false;

        emit CommentUnliked(_postId, _commentId, msg.sender);
    }

    function getPost(uint256 _postId) external view returns (Post memory) {
        require(_postId > 0 && _postId <= _postIds.current(), "Invalid post ID");
        return posts[_postId];
    }

    function getComment(uint256 _postId, uint256 _commentId) external view returns (Comment memory) {
        require(_postId > 0 && _postId <= _postIds.current(), "Invalid post ID");
        require(_commentId > 0 && _commentId <= posts[_postId].commentCount, "Invalid comment ID");
        return comments[_postId][_commentId];
    }

    function getPostLikeStatus(uint256 _postId, address _user) external view returns (bool) {
        return postLikes[_postId][_user];
    }

    function getCommentLikeStatus(uint256 _postId, uint256 _commentId, address _user) external view returns (bool) {
        return commentLikes[_postId][_commentId][_user];
    }

    // Additional functions can be added here, such as:
    // - Editing posts or comments
    // - Deleting posts or comments
    // - Reporting inappropriate content
    // - Pagination for posts and comments
}