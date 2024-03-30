import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { ethers } from "hardhat";

async function waitMillis(millis:number):Promise<void>{
  return new Promise<void>((resolve,reject)=>{
      setTimeout(()=>{
          resolve();
      },millis,"");
  });
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy,log} = deployments;
  const {deployer} = await getNamedAccounts();

  let configHardhat:any=hre.config.networks[hre.network.name];
  let config:any=configHardhat.CNFT;

  const templateAddress:string = (await deployments.get('cnftProject')).address;
  const factoryAddress:string = (await deployments.get('cnftFactory')).address; 

  const ARGS_TEMPLATE:any[]=[]
 
  const ARGS_FACTORY:any[] = [
    config.owner,
    templateAddress
  ]

  

  if(config.VERIFY){
    log("Wait until contract is indexed by scanning services (10s)")
    await waitMillis(10000); // Give time to polygonscan backend to process these contracts

    await hre.run("verify:verify",{
      address:templateAddress,
      constructorArguments:ARGS_TEMPLATE
    });
  };
  
  if(config.VERIFY){
    await hre.run("verify:verify",{
      address:factoryAddress,
      constructorArguments:ARGS_FACTORY
    });
  };
};

export default func;
func.tags = ['Verify'];
func.dependencies = ['ST_crypt','Jackpot']