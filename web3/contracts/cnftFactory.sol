// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract cnftFactory is Ownable, Pausable{

    uint256 public currentVersion;
    address public lastCreated;

    mapping(uint256 => address) private template; //Version => template
    
    address[] public allContractAddress;

    event changeTemplateEvent(
        address indexed template,
        uint256 indexed version,
        address oldTemplate,
        uint256 oldVersion
    );

    event clonedContractEvent(address indexed newContract);

    constructor(address _owner, address _template) Ownable(_owner)
    {
        template[currentVersion] = _template;
    } 

    function allContractAddressLenth() public view returns(uint256){
        return allContractAddress.length;
    }

    /**
    Change version of the template to be clonedsç
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
            "CBFT: Existing version"
        );
        require(_isContract(newTemplate), "CBFT: must be a contract");
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
    function clone() external whenNotPaused returns(address) {
        address newContract = Clones.clone(template[currentVersion]);
        allContractAddress.push(newContract);
        lastCreated = newContract;
        emit clonedContractEvent(lastCreated);
        return newContract;
    }

    function pause() external whenNotPaused{
        _pause();
    }

    function unPause() external whenPaused(){
        _unpause();
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