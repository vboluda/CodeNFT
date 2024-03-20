// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable-4.7.3/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable-4.7.3/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable-4.7.3/token/ERC721/IERC721Upgradeable.sol";

/**
    Standard ERC-721 contract with upgradeability capabilities
    @author METAENGIE
 */
contract cnftProject is 
Initializable,
OwnableUpgradeable,
IERC721Upgradeable
{
    // nftIdentifier counter. It will provide a successively incremented identifier.
    uint256 nftCounter;

    // Token name (ERC-721 standard field)
    string public name;

    // Token symbol  (ERC-721 standard field)
    string public symbol;

    mapping(uint256 => string) public tokenURIs; //identifier -> URI 
    
    //PROXY FUNCIONS
    
    /**
        Initilizer to susbstiture constructor
        @param _owner of the contract. Will be allowed to upgrade
        @param _name Name of the NFT collection as stated on ERC-721 standard
        @param _symbol Symbol of the NFT collection as stated on ERC-721 standard
     */
    function initialize(address _owner, string memory _name,string memory _symbol) public initializer {
        __Ownable_init();
        _transferOwnership(_owner);
        name = _name;
        symbol = _symbol;
    }

    //END PROXY FUNCTONS

    /**
        Safe mint by the author. It assigns new mitedNFT to the author
        @param uri location of the asset
     */
    function safeMint(string memory uri) external onlyOwner {
        _safeMint(uri);
    }

    // ERC-721 standard functions

    /**
         @inheritdoc IERC721Upgradeable
         @notice Global owner is the unique Proprietor of the entire collection
     */
    function balanceOf(address _owner) external override view returns (uint256 balance){
        if(_owner == owner()){
            return nftCounter;
        }else{
            return 0;
        }
    }

    /**
         @inheritdoc IERC721Upgradeable
         @notice Global owner is the unique Proprietor of the entire collection
     */
    function ownerOf(uint256) external override view returns (address _owner){
        return owner();
    }

     /**
         @inheritdoc IERC721Upgradeable
         @notice Disabled
     */
    function safeTransferFrom(address,address,uint256,bytes calldata) external override {
        revert("CNFT:safeTransferFrom not allowed");
    }

    /**
         @inheritdoc IERC721Upgradeable
         @notice Disabled
     */
    function safeTransferFrom(address,address, uint256) external override{
         revert("CNFT:safeTransferFrom not allowed");
    }

    /**
         @inheritdoc IERC721Upgradeable
         @notice Disabled
     */
    function transferFrom(
        address,
        address,
        uint256
    ) external override{
         revert("CNFT:safeTransfer not allowed");
    }

    /**
         @inheritdoc IERC721Upgradeable
         @notice Disabled
     */
    function approve(address, uint256) external override{
        revert("CNFT:approve not allowed");
    }

    /**
         @inheritdoc IERC721Upgradeable
         @notice Disabled
     */
    function setApprovalForAll(address, bool) external{
        revert("CNFT:setApprovalForAll not allowed");
    }


    /**
         @inheritdoc IERC721Upgradeable
         @notice Disabled
     */
    function getApproved(uint256) external view returns (address operator){
        return owner();
    }

    /**
         @inheritdoc IERC721Upgradeable
         @notice Disabled
     */
    function isApprovedForAll(address _owner, address operator) external view returns (bool){
        return (_owner == owner() && operator == owner());
     }


    /**
         @inheritdoc IERC165Upgradeable
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool){
         return
            interfaceId == type(IERC721Upgradeable).interfaceId ||
                 interfaceId == type(Initializable).interfaceId ||
                 interfaceId == type(OwnableUpgradeable).interfaceId;

     }



    /************************************************************
                      INTERNAL FUNCTIONS
     ************************************************************/

    /**
        Safe mint by the owner and assign the asset to an address
        @param uri location of the assetº
     */
    function _safeMint(string memory uri) internal  {
        tokenURIs[nftCounter] = uri;
        nftCounter++; // Not safe as nftCounter has 2 pow 256 values it is not necessary additional checks

    }
}
