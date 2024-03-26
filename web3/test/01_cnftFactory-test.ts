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
    let cnftProject__factory:CnftProject__factory;
    let cnftProject:CnftProject;

    async function deployFixture(ownerAddress:string):Promise<[CnftFactory,CnftProject,CnftProject__factory]>{

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
        ethers.getContractFactory("cnftFactory") as Promise<CnftFactory__factory>,
        ethers.getContractFactory("cnftProject") as Promise<CnftProject__factory>
      ]);
      let cnftProject:CnftProject = await cnftProject__factory.deploy();
      await cnftProject.initialize(ownerAddress,"CODE NFT","CNFT");
      let cnftFactory:CnftFactory = await cnftFactory_Factory.deploy(ownerAddress, await cnftProject.getAddress());

      return [cnftFactory,cnftProject,cnftProject__factory];
    };

    this.beforeEach(async function () {

        [cnftFactory, cnftProject,cnftProject__factory] = await deployFixture(ownerAddress);
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

    describe("Update template function", function () {
  
      it("Should prevent non-owners from changing the template version", async function () {
          const newVersion = 1;
          // Expect revert when a non-owner tries to change the template version
          await expect(cnftFactory.connect(Other).changeTemplateVersion(newVersion))
          .to.be.revertedWithCustomError(cnftFactory, 'OwnableUnauthorizedAccount')
          .withArgs(otherAddress);
      });
  
      it("Should allow the owner to change the template", async function () {
        // Deploy a new cnftProject for the new template
        const newCnftProject:CnftProject = await cnftProject__factory.deploy();
        const newTemplate:string = await newCnftProject.getAddress();
        const newVersion = 2;
        // Change the template
        await expect(cnftFactory.connect(Owner).changeTemplate(newVersion, newTemplate))
        .to.emit(cnftFactory,"changeTemplateEvent")
        .withArgs(
          newTemplate,
          newVersion,
          await cnftProject.getAddress(),
          0
        );
        // Verify the change
        const currentTemplate = await cnftFactory.template(newVersion);
        expect(currentTemplate).to.equal(newTemplate);

        await expect(cnftFactory.connect(Owner).changeTemplate(newVersion+1, otherAddress))
        .to.be.revertedWith("CNFT: must be a contract");

        await expect(cnftFactory.connect(Owner).changeTemplate(newVersion+1, cnftFactory))
        .to.be.revertedWith("CNFT: Wrong contract interfaces");
      });
  
      it("Should prevent non-owners from changing the template", async function () {
        const newVersion = 2;
        const newTemplate = ZERO_ADDRESS; // Just for test purpose

        // Expect revert when a non-owner tries to change the template
        await expect(cnftFactory.connect(Other).changeTemplate(newVersion, newTemplate))
          .to.be.revertedWithCustomError(cnftFactory, 'OwnableUnauthorizedAccount')
          .withArgs(otherAddress);
      });

      it("Should allow the owner to change the template version", async function () {
        // Assume 1 is a valid new version for testing
        const newVersion = 1;
        const oldVersion = await cnftFactory.currentVersion();
        const cnftProjectFactory = await ethers.getContractFactory("cnftProject");
        const newCnftProject = await cnftProjectFactory.deploy();
    
        const newTemplate = await newCnftProject.getAddress();
      
        // Change the template
        await cnftFactory.connect(Owner).changeTemplate(newVersion, newTemplate);

    
        // Change the template version
        await expect(cnftFactory.connect(Owner).changeTemplateVersion(newVersion))
        .to.be.revertedWith("CNFT:Wrong version");

        await expect(cnftFactory.connect(Owner).changeTemplateVersion(oldVersion))
        .to.emit(cnftFactory,"changeTemplateEvent")
        .withArgs(
          await cnftProject.getAddress(),
          0,
          newTemplate,
          newVersion,
        );
    
        // Verify the change
        const currentVersion = await cnftFactory.currentVersion();
        expect(currentVersion).to.not.equal(newVersion);
        expect(currentVersion).to.equal(oldVersion);
    });

    it("Should not allow the owner to change the template version when paused", async function () {
         // Assume 1 is a valid new version for testing
         const newVersion = 1;
         const oldVersion = await cnftFactory.currentVersion();
         const cnftProjectFactory = await ethers.getContractFactory("cnftProject");
         const newCnftProject = await cnftProjectFactory.deploy();
     
         const newTemplate = await newCnftProject.getAddress();
       
         // Change the template
         await cnftFactory.connect(Owner).changeTemplate(newVersion, newTemplate);

         await cnftFactory.connect(Owner).pause();
     
         // Change the template version
         await expect(cnftFactory.connect(Owner).changeTemplateVersion(newVersion))
         .to.be.revertedWithCustomError(cnftFactory, "EnforcedPause");
    });

    it("Should not allow the owner to change the template when paused", async function () {
      // Deploy a new cnftProject for the new template
      const newCnftProject:CnftProject = await cnftProject__factory.deploy();
      const newTemplate:string = await newCnftProject.getAddress();
      const newVersion = 2;

      await cnftFactory.connect(Owner).pause();

      // Change the template
      await expect(cnftFactory.connect(Owner).changeTemplate(newVersion, newTemplate))
      .to.be.revertedWithCustomError(cnftFactory,"EnforcedPause")

    });
  }); 
});
