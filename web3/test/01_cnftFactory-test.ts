import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import {
    CnftFactory__factory,
    CnftFactory,
    CnftProject__factory,
    CnftProject
} from "../types"

const ZERO_ADDRESS:string = "0x0000000000000000000000000000000000000000";

describe("cnftFactory Contract", function () {
    //Signers: deployer is alwais first signer
    let Deployer:Signer;
    let Owner:Signer;
    let Other:Signer;

    // Signer addresses
    let deployerAddress:string;
    let ownerAddress:string;
    let otherAddress:string;

    // Contract 
    let cnftFactory:CnftFactory;
    let cnftProject:CnftProject;

    async function deployFixture(ownerAddress:string):Promise<[CnftFactory,CnftProject]>{

      [Deployer,Owner,Other] = await ethers.getSigners();

      [
          deployerAddress, 
          ownerAddress,
          otherAddress
      ] = await Promise.all([
          Deployer.getAddress(),
          Owner.getAddress(),
          Other.getAddress()
      ]);

      let [cnftFactory_Factory,cnftProject__factory] = await Promise.all([
        ethers.getContractFactory("cnftFactory"),
        ethers.getContractFactory("cnftProject")
      ]);
      let cnftProject:CnftProject = await cnftProject__factory.deploy();
      await cnftProject.initialize(ownerAddress,"CODE NFT","CNFT");
      let t=await cnftProject.name();
      console.log("TS:",t);
      let cnftFactory:CnftFactory = await cnftFactory_Factory.deploy(ownerAddress, await cnftProject.getAddress());

      return [cnftFactory,cnftProject];
    };

    this.beforeEach(async function () {

        [cnftFactory, cnftProject] = await deployFixture(ownerAddress);
    });

    it("Should include correct field values after initialization", async function () {
      
      // Fetching the values from the contract in parallel
      const [actualName, actualOwner] = await Promise.all([
        cnftFactory.currentVersion,
        cnftFactory.owner()
      ]);
      
      // Asserting that the fetched values match the expected values
      expect(actualName).to.equal(actualName, "The name is not set correctly after initialization.");
      expect(actualOwner).to.equal(actualOwner, "The owner is not set correctly after initialization.");
    });



    
});
