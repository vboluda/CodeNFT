// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable-4.7.3/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable-4.7.3/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable-4.7.3/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable-4.7.3/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

/**
    Standard ERC-721 contract with upgradeability capabilities
    @author METAENGIE
 */
contract ME_NFT is 
Initializable,
 OwnableUpgradeable,
 ERC721URIStorageUpgradeable
 {
     uint256 nftCounter;
     address author;
    
    modifier onlyAuthor(){
        require(_msgSender() == author , "cnft: not author");
        _;
    }

    //PROXY FUNCIONS
    
    /**
        Initilizer to susbstiture constructor
        @param _owner of the contract. Will be allowed to upgrade
        @param _author collection author
        @param _name Name of the NFT collection as stated on ERC-721 standard
        @param _symbol Symbol of the NFT collection as stated on ERC-721 standard
     */
    function initialize(address _owner, address _author, string memory _name,string memory _symbol) public initializer {
        __Ownable_init();
        _transferOwnership(_owner);
        __ERC721_init(_name, _symbol);
        __ERC721URIStorage_init();
        author=_author;
    }

    //END PROXY FUNCTONS

    /**
        Safe mint by the author. It assigns new mitedNFT to the author
        @param uri location of the asset
     */
    function safeMint(string memory uri) external onlyAuthor {
        _safeMint(_msgSender(),uri);
    }

    
    /**
        Safe mint by the owner and assign the asset to an address
        @param to will be the owner of this NFT
        @param uri location of the asset
     */
    function safeMintTo(address to, string memory uri) external onlyOwner {
        _safeMint(to,uri);
    }

    /**
        returns the author od this collection
        @return addres Address of the author
     */
    function getAuthor() public view returns(address){
        return author;
    }

    /************************************************************
                      INTERNAL FUNCTIONS
     ************************************************************/

    /**
        Safe mint by the owner and assign the asset to an address
        @param to will be the owner of this NFT
        @param uri location of the assetº
     */
    function _safeMint(address to, string memory uri) internal  {
        uint256 tokenId = nftCounter;
        nftCounter++; // Not safe as nftCounter has 2 pow 256 values it is not necessary additional checks
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }


}
