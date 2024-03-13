import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

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
      blockGasLimit:10000000000
    },
    mumbai: {
      url: "https://rpc.ankr.com/polygon_mumbai",
      accounts: [`0xeaed8e9bd2f74af2a294e19184cc98e23a2db445f354b174383743c55297b3db`],
      chainId: 80001
    },  
  }
};

export default config;
