// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable-4.7.3/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable-4.7.3/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable-4.7.3/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable-4.7.3/utils/introspection/IERC165Upgradeable.sol";

/**
    Standard ERC-721 contract with upgradeability capabilities
    @notice This is a non transferrable NFT. All NFT minted will have the same owner -> contract's owner
    @author Vicente Boluda Vias
 */
contract cnftProject is 
Initializable,
OwnableUpgradeable,
IERC721Upgradeable
{
    // nftIdentifier counter. It will provide a successively incremented identifier.
    uint256 public nftCounter;

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
    function ownerOf(uint256 id) external override view returns (address _owner){
        if(id >= nftCounter){
            return address(0);
        }
        return owner();
    }

     /**
         @inheritdoc IERC721Upgradeable
         @notice Disabled as cannot be transferred
     */
    function safeTransferFrom(address,address,uint256,bytes calldata) external override {
        revert("CNFT:safeTransferFrom not allowed");
    }

    /**
         @inheritdoc IERC721Upgradeable
         @notice Disabled as cannot be transferred
     */
    function safeTransferFrom(address,address, uint256) external override{
         revert("CNFT:safeTransferFrom not allowed");
    }

    /**
         @inheritdoc IERC721Upgradeable
         @notice Disabled as cannot be transferred
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
         @notice Not neeeded as cannot be transferred
     */
    function approve(address, uint256) external override{
        revert("CNFT:approve not allowed");
    }

    /**
         @inheritdoc IERC721Upgradeable
         @notice Not neeeded as cannot be transferred
     */
    function setApprovalForAll(address, bool) external{
        revert("CNFT:setApprovalForAll not allowed");
    }


    /**
         @inheritdoc IERC721Upgradeable
         @notice Owner will be the unique approved. Just for compatibitity as NFT cannot be trasferred 
     */
    function getApproved(uint256) external view returns (address operator){
        return owner();
    }

    /**
         @inheritdoc IERC721Upgradeable
          @notice Owner will be the unique approved. Just for compatibitity as NFT cannot be trasferred 
     */
    function isApprovedForAll(address _owner, address operator) external view returns (bool){
        return (_owner == owner() && operator == owner());
     }


    /**
         @inheritdoc IERC165Upgradeable
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool){
         return
            interfaceId == type(IERC165Upgradeable).interfaceId ||
            interfaceId == type(IERC721Upgradeable).interfaceId ||
            interfaceId == type(OwnableUpgradeable).interfaceId ||
            interfaceId == this.safeMint.selector;
     }

    /************************************************************
                      INTERNAL FUNCTIONS
     ************************************************************/

    /**
        Safe mint by the owner and assign the asset to an address
        @param uri location of the assetº
     */
    function _safeMint(string memory uri) internal  {
        uint256 current = nftCounter;
        tokenURIs[current] = uri;
        nftCounter++; // Not safe as nftCounter has 2 pow 256 values it is not necessary additional checks
        emit Transfer(address(0),owner(),current);
    }
}
