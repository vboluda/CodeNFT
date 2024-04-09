import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import 'dotenv/config';

const DUMMY_PK:string     = "0x0000000000000000000000000000000000000000000000000000000000000000";
// console.log("PK "+ process.env.DEV_PK_MUMBAI);

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {version: "0.8.0"},
      {version: "0.8.4"},
      {version: "0.8.8"},
      {version: "0.8.9"},
      {version: "0.8.20"}
    ]
  },
  paths: {
    deploy: 'deploy',
    deployments: 'deployments',
    imports: 'imports'
  },
  namedAccounts: {
    deployer: {
        default: 0, 
        137: 0, 
        80001: 0, 
    }
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
  etherscan: {
    apiKey: "4XEX8ASQ6CQXE44V4VQSSC2CV34CWE3XPK",
  },
  networks: {
    hardhat: {
      chainId: 1337,
      live:false,
      blockGasLimit:10000000000,
      CNFT:{
        owner: "0xfB692f53a8bE8E43bAcb89c90dF51199eBe23eAd",
        VERIFY:false
      }
    },
    mumbai: {
      url: "https://rpc.ankr.com/polygon_mumbai",
      accounts: [`${process.env.DEV_PK_MUMBAI}`],
      chainId: 80001,
      CNFT:{
        owner: "0xfB692f53a8bE8E43bAcb89c90dF51199eBe23eAd",
        VERIFY:true
      }
    },
    miroll: {
      url: "https://condorglen-rpc.eu-north-2.gateway.fm",
      accounts: [`${process.env.DEV_PK_MIROLL}`],
      chainId: 315476595,
      CNFT:{
        owner: "0xfB692f53a8bE8E43bAcb89c90dF51199eBe23eAd",
        VERIFY:false
      }
    },    
  }
};

export default config;
