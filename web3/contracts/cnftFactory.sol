// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts-upgradeable-4.7.3/utils/introspection/ERC165CheckerUpgradeable.sol";
import "./cnftProject.sol";

contract cnftFactory is Ownable, Pausable{
    
    using ERC165CheckerUpgradeable for address;

    // Current version of the template
    uint256 public currentVersion;
    // Last created contract
    address public lastCreated;

    mapping(uint256 => address) private template; //Version => template

    event changeTemplateEvent(
        address indexed template,
        uint256 indexed version,
        address oldTemplate,
        uint256 oldVersion
    );

    event clonedContractEvent(
        address indexed newContract,
        uint256 indexed version,
        address templateContract,
        string projectName
    );

    /**
        @param _owner Owner of the contract
        @param _template Template to be cloned
     */
    constructor(address _owner, address _template) Ownable(_owner)
    {
        require(checkInterfaces(_template), "CBFT: Wrong contract interfaces");
        template[currentVersion] = _template;
    }

    /**
        @param _contractAddress Contract address to be checked
     */
    function checkInterfaces(address _contractAddress) public view returns (bool) {
        bool supportsIERC721Upgradeable = _contractAddress.supportsInterface(type(IERC721Upgradeable).interfaceId);
        bool supportsOwnableUpgradeable = _contractAddress.supportsInterface(type(OwnableUpgradeable).interfaceId);
        bool hasSafeMintFunction = _contractAddress.supportsInterface(cnftProject.safeMint.selector);

        return supportsIERC721Upgradeable && supportsOwnableUpgradeable && hasSafeMintFunction;
    }

    /**
        Change version of the template to be clonedsç
        @notice Contract must imoplemnt the IERC721Upgradeable and OwnableUpgradeable interfaces        
        @param newVersion swith to an existing version
    */
    function changeTemplateVersion(uint256 newVersion) external onlyOwner{
        require(
            template[newVersion] != address(0) && newVersion != currentVersion,
            "CBFT:Wrong version"
        );
        uint256 oldVersion = currentVersion;
        address oldTemplate = template[currentVersion];
        currentVersion = newVersion;
        emit changeTemplateEvent(
            template[currentVersion],
            currentVersion,
            oldTemplate,
            oldVersion
        );
    }

     /**
        Change version of the template to be clonedsç
        @param newVersion Template version
        @param newTemplate new template asociated with previous version
     */
    function changeTemplate(uint256 newVersion,address newTemplate) external onlyOwner{
        require(
            template[newVersion] == address(0) ,
            "CBFT: Unexisting version"
        );
        require(_isContract(newTemplate), "CBFT: must be a contract");
        require(checkInterfaces(newTemplate), "CBFT: Wrong contract interfaces");
        uint256 oldVersion = currentVersion;
        address oldTemplate = template[currentVersion];
        currentVersion = newVersion;
        template[currentVersion] = newTemplate;

        emit changeTemplateEvent(
            template[currentVersion],
            currentVersion,
            oldTemplate,
            oldVersion
        );
    }

    /**
        Get current version
        @return template associated with current version
     */
    function getCurrentTemplate() public view returns(address){
        return template[currentVersion];
    }

      /**
        Uses clone mechanism to create a new contract from current version template
        @return address new cloned contract address
     */
    function clone(string memory _symbol, string memory _projectName) external whenNotPaused returns(address) {
    // Calculate the hash of _projectName to use as salt
        bytes32 projectNameHash = keccak256(abi.encodePacked(_projectName));

        // Calculate the deterministic address for the new contract
        // Assume getDeterministicAddress is a function that returns the address
        // where the cloned contract would be deployed using the given salt.
        // This function needs to be implemented according to the logic of your deterministic cloning.
        address deterministicAddress = Clones.predictDeterministicAddress(template[currentVersion], projectNameHash);

        // Check if there is already code at the calculated address
        require(!_isContract(deterministicAddress), "CBFT: Contract already exists");

        // Use the deterministic version of the clone function
        address newContract = Clones.cloneDeterministic(template[currentVersion], projectNameHash);

        lastCreated = newContract;

        emit clonedContractEvent(lastCreated,currentVersion,template[currentVersion],_projectName);

        return newContract;
    }

    /**
        @notice Pause the contract
     */
    function pause() external whenNotPaused onlyOwner(){
        _pause();
    }

    /**
        @notice Unpause the contract
     */
    function unPause() external whenPaused onlyOwner(){
        _unpause();
    }

    /**
        @notice Locate contract address from a given project name
        @param _projectName project name
        @param _version version of the template that has created the contract
        @return address contract address
    */
    function locateContractAddress(string memory _projectName,uint256 _version) public view returns(address){
        bytes32 projectNameHash = keccak256(abi.encodePacked(_projectName));
        address deterministicAddress = Clones.predictDeterministicAddress(template[_version], projectNameHash);
        return deterministicAddress;
    }

    /**
        @notice Locate contract address from a given project name and current template version
        @param _projectName project name
        @return address contract address
    */
    function locateContractAddress(string memory _projectName) public view returns(address){
        bytes32 projectNameHash = keccak256(abi.encodePacked(_projectName));
        address deterministicAddress = Clones.predictDeterministicAddress(template[currentVersion], projectNameHash);
        return deterministicAddress;
    }



    /***************************************************
                INTERNAL FUNCTIONS
    ****************************************************/

     /**
     * @notice Returns true if `account` is a contract.
     * @param account: account address
     */
    function _isContract(address account) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }
}