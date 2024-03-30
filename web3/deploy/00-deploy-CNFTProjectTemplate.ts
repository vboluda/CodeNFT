import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy,log} = deployments;
  const {deployer} = await getNamedAccounts();

  let configHardhat:any=hre.config.networks[hre.network.name];
 
  const ARGS:any[]=[];
  //console.log("Parameters: "+JSON.stringify(ARGS));
  let deployResult:any = await deploy('cnftProject', {
    from: deployer,
    args: ARGS,
    log: true
  });
  if (!deployResult.newlyDeployed) {
    log(
      `Reusing STO_crypt deployed at ${deployResult.address}`
    );
  }else{
    log(
      ` NEW STO_crypt deployed at  ${deployResult.address}  using ${deployResult.receipt.gasUsed} gas`
    );
  }
};

export default func;
func.tags = ['CNFTProjectTemplate'];