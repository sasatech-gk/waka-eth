// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract WakaNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Events for tracking verse creation
    event UpperVerseCreated(uint256 indexed tokenId, address creator, string upperVerse);
    event LowerVerseAdded(uint256 indexed tokenId, address creator, string lowerVerse);
    event WakaCompleted(uint256 indexed tokenId, address upperCreator, address lowerCreator);

    // Struct to store verse information
    struct Verse {
        string upperVerse;
        string lowerVerse;
        address upperCreator;
        address lowerCreator;
        bool isComplete;
    }

    // Mapping from token ID to verse information
    mapping(uint256 => Verse) public verses;

    constructor() ERC721("WakaNFT", "WAKA") Ownable(msg.sender) {}

    // Function to create upper verse and start a new waka
    function createUpperVerse(string memory _upperVerse, address recipient) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(recipient, tokenId);
        _setTokenURI(tokenId, _generateTokenURI(tokenId));
        verses[tokenId] = Verse({
            upperVerse: _upperVerse,
            lowerVerse: "",
            upperCreator: msg.sender,
            lowerCreator: address(0),
            isComplete: false
        });

        emit UpperVerseCreated(tokenId, msg.sender, _upperVerse);
        return tokenId;
    }

    // Function to add lower verse and complete the waka
    function addLowerVerse(uint256 _tokenId, string memory _lowerVerse) public {
        require(_tokenId < _nextTokenId, "Token ID does not exist");
        require(!verses[_tokenId].isComplete, "Waka is already complete");
        require(verses[_tokenId].lowerCreator == address(0), "Lower verse already exists");

        Verse storage verse = verses[_tokenId];
        verse.lowerVerse = _lowerVerse;
        verse.lowerCreator = msg.sender;
        verse.isComplete = true;

        // Generate new token IDs for both participants
        uint256 upperTokenId = _nextTokenId++;
        uint256 lowerTokenId = _nextTokenId++;

        // Copy verse data to new tokens
        verses[upperTokenId] = verse;
        verses[lowerTokenId] = verse;

        // Mint new NFTs to both creators and set their URIs
        _mint(verse.upperCreator, upperTokenId);
        _mint(verse.lowerCreator, lowerTokenId);
        _setTokenURI(upperTokenId, _generateTokenURI(upperTokenId));
        _setTokenURI(lowerTokenId, _generateTokenURI(lowerTokenId));

        // Burn the original token if it exists (has an owner)
        if (_ownerOf(_tokenId) != address(0)) {
            _burn(_tokenId);
        }

        emit LowerVerseAdded(_tokenId, msg.sender, _lowerVerse);
        emit WakaCompleted(_tokenId, verse.upperCreator, msg.sender);
    }

    // Function to get verse information
    function getVerse(uint256 _tokenId) public view returns (
        string memory upperVerse,
        string memory lowerVerse,
        address upperCreator,
        address lowerCreator,
        bool isComplete
    ) {
        require(_tokenId < _nextTokenId, "Token ID does not exist");
        Verse memory verse = verses[_tokenId];
        return (
            verse.upperVerse,
            verse.lowerVerse,
            verse.upperCreator,
            verse.lowerCreator,
            verse.isComplete
        );
    }

    // Override required functions
    function _generateTokenURI(uint256 tokenId) internal view returns (string memory) {
        Verse memory verse = verses[tokenId];
        string memory json = Base64.encode(
            bytes(string(abi.encodePacked(
                '{"name": "Waka #', 
                Strings.toString(tokenId),
                '", "description": "A collaborative Japanese poem (Waka)", "attributes": [{"trait_type": "Upper Verse", "value": "',
                verse.upperVerse,
                '"}, {"trait_type": "Lower Verse", "value": "',
                verse.lowerVerse,
                '"}]}'
            )))
        );
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    // Override transfer-related functions to implement SBT functionality
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        require(
            from == address(0) || // Allow minting
            to == address(0) || // Allow burning
            !verses[tokenId].isComplete, // Allow transfer of incomplete verses
            "WakaNFT: Transfer of completed Waka is not allowed"
        );
        return super._update(to, tokenId, auth);
    }

    // Override approval functions to prevent approvals for completed Waka
    function approve(address to, uint256 tokenId) public virtual override(ERC721, IERC721) {
        require(
            !verses[tokenId].isComplete,
            "WakaNFT: Approval of completed Waka is not allowed"
        );
        super.approve(to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public virtual override(ERC721, IERC721) {
        revert("WakaNFT: setApprovalForAll is disabled for SBT functionality");
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
