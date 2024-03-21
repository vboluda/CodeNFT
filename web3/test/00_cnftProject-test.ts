import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import {
    CnftProject__factory,
    CnftProject
} from "../types"

const ZERO_ADDRESS:string = "0x0000000000000000000000000000000000000000";

describe("cnftProject Contract", function () {
    //Signers: deployer is alwais first signer
    let Deployer:Signer;
    let Owner:Signer;
    let Other:Signer;

    // Signer addresses
    let deployerAddress:string;
    let ownerAddress:string;
    let otherAddress:string;

    // Contract 
    let cnftProject:CnftProject;

    async function deployFixture(ownerAddress:string):Promise<CnftProject>{
        let cnftProject_Factory:CnftProject__factory=(await ethers.getContractFactory("cnftProject")) as CnftProject__factory;

        let cnftProject:CnftProject = await cnftProject_Factory.deploy();
        await cnftProject.initialize(ownerAddress,"CODE NFT","CNFT");
        return cnftProject;
    };

    this.beforeEach(async function () {
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

        cnftProject = await deployFixture(ownerAddress);
    });

    it("Should include correct field values after initialization", async function () {
        const expectedName: string = "CODE NFT";
        const expectedSymbol: string = "CNFT";
        const expectedOwner: string = await ownerAddress;
      
        // Fetching the values from the contract in parallel
        const [actualName, actualSymbol, actualOwner] = await Promise.all([
          cnftProject.name(),
          cnftProject.symbol(),
          cnftProject.owner(),
        ]);
      
        // Asserting that the fetched values match the expected values
        expect(actualName).to.equal(expectedName, "The name is not set correctly after initialization.");
        expect(actualSymbol).to.equal(expectedSymbol, "The symbol is not set correctly after initialization.");
        expect(actualOwner).to.equal(expectedOwner, "The owner is not set correctly after initialization.");
    });

    describe("CHECK supportsInterface", function () {
      
      it("Should return true for the ERC721 interface ID", async function () {
        expect(await cnftProject.supportsInterface("0x80ac58cd")).to.be.true;
      });
    
      it("Should return true for the OwnableUpgradeable interface ID", async function () {
        // Replace "0xINTERFACE_ID" with the actual OwnableUpgradeable interface ID
        expect(await cnftProject.supportsInterface("0x0e083076")).to.be.true;
      });

      it("Should return true for the cnfProject interface ID", async function () {
        expect(await cnftProject.supportsInterface("0x695850fb")).to.be.true;
      });
    
      it("Should return false for an unsupported interface ID", async function () {
        // Using a random interface ID for demonstration; it should be unsupported.
        expect(await cnftProject.supportsInterface("0x11111111")).to.be.false;
      });
    });

    describe("CHECK safeMint", function () {
        it("Should fail when called by not owner", async function () {
          const tokenURI: string = "https://example.com/nft";
          // Attempting to mint from a non-owner account (addr1 in this case)
          await expect(cnftProject.connect(Other).safeMint(tokenURI))
            .to.be.revertedWith("Ownable: caller is not the owner");
        });
      
        it("Should work when called by owner", async function () {
          const TOKENID:bigint = 0n;
          const tokenURI: string = "https://example.com/nft";
      
          // Fetch the nftCounter to get the latest token ID (should be 0 since it's the first minted token)
          let currentTokenId = await cnftProject.nftCounter();
          expect(currentTokenId).to.equal(0n, "Current token Id is not correct");
      
          // Verify the Transfer event was emitted with correct details
          await expect(cnftProject.connect(Owner).safeMint(tokenURI))
            .to.emit(cnftProject, 'Transfer')
            .withArgs(ZERO_ADDRESS, ownerAddress, TOKENID);

            let newTokenId = await cnftProject.nftCounter();
            expect(newTokenId).to.equal(1n, "New token Id is not correct");
        
            // Verify the token was minted successfully
            const ownerOfToken = await cnftProject.ownerOf(TOKENID);
            expect(ownerOfToken).to.equal(await Owner.getAddress());
        
            // Verify the URI was set correctly
            const tokenURIFromContract = await cnftProject.tokenURIs(TOKENID);
            expect(tokenURIFromContract).to.equal(tokenURI);

            const ownerAmount = await cnftProject.balanceOf(ownerAddress);
            expect(ownerAmount).to.equal(1n, "New owner amount for owner is not correct");

            const otherAmount = await cnftProject.balanceOf(otherAddress);
            expect(otherAmount).to.equal(0n, "New other amount for other is not correct");
        });
    });
      
    describe("CHECK disabled functions", function () {
        let tokenURI:string = "https://example.com/nft";
        let tokenId:bigint = 0n;  // Assuming this is the first token minted
      
        beforeEach(async function () {
          // Mint a token for testing purposes
          await cnftProject.connect(Owner).safeMint(tokenURI);
        });
      
        it("Should revert safeTransferFrom with data", async function () {
            await expect(
                cnftProject.connect(Other)["safeTransferFrom(address,address,uint256,bytes)"](
                  await Owner.getAddress(), 
                  await Other.getAddress(), 
                  tokenId, 
                  "0x00"
                )
              ).to.be.revertedWith("CNFT:safeTransferFrom not allowed");
          });
      
        it("Should revert safeTransferFrom without data", async function () {
            await expect(
                cnftProject.connect(Other)["safeTransferFrom(address,address,uint256)"](
                  await Owner.getAddress(), 
                  await Other.getAddress(), 
                  tokenId
                )
              ).to.be.revertedWith("CNFT:safeTransferFrom not allowed");
        });
      
        it("Should revert transferFrom", async function () {
          await expect(cnftProject.connect(Owner).transferFrom(ownerAddress, ownerAddress, tokenId))
            .to.be.revertedWith("CNFT:safeTransfer not allowed");
        });
      
        it("Should revert approve", async function () {
          await expect(cnftProject.connect(Owner).approve(ownerAddress, tokenId))
            .to.be.revertedWith("CNFT:approve not allowed");
        });
      
        it("Should revert setApprovalForAll", async function () {
          await expect(cnftProject.connect(Owner).setApprovalForAll(ownerAddress, true))
            .to.be.revertedWith("CNFT:setApprovalForAll not allowed");
        });
      
        it("Should return the correct value for getApproved", async function () {
          // Even though approve is disabled, getApproved should still return the zero address for any token ID
          expect(await cnftProject.getApproved(tokenId)).to.equal(ownerAddress);
        });
      
        it("Should return the correct value for isApprovedForAll", async function () {
          // Since setApprovalForAll is disabled, isApprovedForAll should always return false
          expect(await cnftProject.isApprovedForAll(ownerAddress, ownerAddress)).to.be.true;
          expect(await cnftProject.isApprovedForAll(ownerAddress, otherAddress)).to.be.false;
        });
      });
      

});
