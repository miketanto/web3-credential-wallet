const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("SkillsWallet", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  const credentialType = "Math";
  const credentialType2 = "ECE"
  async function deploySkillsWalletFixture() {
    const baseURI = "https://www.baseURI.com/"


    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, account3] = await ethers.getSigners();

    const SkillsWallet = await ethers.getContractFactory("SkillsWallet");
    const skillswallet = await SkillsWallet.deploy(baseURI,owner.address);

    return {skillswallet, baseURI, owner, otherAccount, account3};
  }

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      const { skillswallet, owner } = await loadFixture(deploySkillsWalletFixture);

      expect(await skillswallet.isCredentialer(owner.address)).to.equal(true);
    });
  });

  describe("Setup", function () {

    //Assume that create credential type will work

    describe("Add Head that is not a current credentialer", function () {
      it("Should add a head", async function () {
        const { otherAccount, skillswallet,owner } = await loadFixture(deploySkillsWalletFixture);
        await skillswallet.createCredentialType(credentialType)
        await skillswallet.addHead(otherAccount.address, credentialType)
        expect(await skillswallet.isHead(otherAccount.address)).to.equal(true);
        expect(await skillswallet.isCredentialer(otherAccount.address)).to.equal(true);
      });

      it("Should be reverted because not a available credential type", async function () {
        const { otherAccount, skillswallet,owner } = await loadFixture(deploySkillsWalletFixture);
        await expect(skillswallet.addHead(otherAccount.address, credentialType)).to.be.revertedWith("Invalid credential type");
      });

      it("Should be reverted because not admin calling", async function () {
        const { otherAccount, skillswallet,owner } = await loadFixture(deploySkillsWalletFixture);
        await expect(skillswallet.connect(otherAccount).addHead(otherAccount.address, credentialType)).to.be.revertedWith("Not the contract admin");
      });
    });

    describe("Add Credentialer with Admin", function () {
      it("Should add a Credentialer", async function () {
        const { otherAccount, skillswallet,owner } = await loadFixture(deploySkillsWalletFixture);
        await skillswallet.createCredentialType(credentialType)
        await skillswallet.addCredentialer(otherAccount.address, credentialType)
        expect(await skillswallet.isHead(otherAccount.address)).to.equal(false);
        expect(await skillswallet.isCredentialer(otherAccount.address)).to.equal(true);
      });

      it("Should be reverted because not a available credential type", async function () {
        const { otherAccount, skillswallet,owner } = await loadFixture(deploySkillsWalletFixture);
        await expect(skillswallet.addCredentialer(otherAccount.address, credentialType)).to.be.revertedWith("Invalid credential type");
      });

      it("Should be reverted because not admin calling", async function () {
        const { otherAccount, skillswallet,owner } = await loadFixture(deploySkillsWalletFixture);
        await expect(skillswallet.connect(otherAccount).addCredentialer(otherAccount.address, credentialType)).to.be.revertedWith("Not an approved head");
      });
    });

    describe("Add Head that is Credentialer with same clearance", function () {
      it("Should add a Head after it is a credentialer", async function () {
        const { otherAccount, skillswallet,owner } = await loadFixture(deploySkillsWalletFixture);
        await skillswallet.createCredentialType(credentialType)
        await skillswallet.addCredentialer(otherAccount.address, credentialType)
        expect(await skillswallet.isHead(otherAccount.address)).to.equal(false);
        expect(await skillswallet.isCredentialer(otherAccount.address)).to.equal(true);
        expect(await skillswallet.hasClearance(otherAccount.address,credentialType)).to.equal(true);

        await skillswallet.addHead(otherAccount.address, credentialType)
        expect(await skillswallet.isHead(otherAccount.address)).to.equal(true);
      });
    });

    describe("Add Head that is Credentialer with different clearance", function () {
      it("Should add a Head after it is a credentialer with a different clearance", async function () {
        const { otherAccount, skillswallet,owner } = await loadFixture(deploySkillsWalletFixture);
        await skillswallet.createCredentialType(credentialType)
        await skillswallet.createCredentialType(credentialType2)
        await skillswallet.addCredentialer(otherAccount.address, credentialType)
        expect(await skillswallet.isHead(otherAccount.address)).to.equal(false);
        expect(await skillswallet.isCredentialer(otherAccount.address)).to.equal(true);
        expect(await skillswallet.hasClearance(otherAccount.address,credentialType)).to.equal(true);

        await skillswallet.addHead(otherAccount.address, credentialType2)
        expect(await skillswallet.isHead(otherAccount.address)).to.equal(true);
        expect(await skillswallet.hasClearance(otherAccount.address,credentialType2)).to.equal(true);
      });
    });

    describe("Add Credentialer with Head", function () {
      it("Should add a Credentialer", async function () {
        const { otherAccount, skillswallet,account3} = await loadFixture(deploySkillsWalletFixture);
        await skillswallet.createCredentialType(credentialType)
        await skillswallet.addHead(otherAccount.address, credentialType)
        expect(await skillswallet.isHead(otherAccount.address)).to.equal(true);
        expect(await skillswallet.isCredentialer(otherAccount.address)).to.equal(true);
        await skillswallet.connect(otherAccount).addCredentialer(account3.address, credentialType)
        expect(await skillswallet.isHead(account3.address)).to.equal(false);
        expect(await skillswallet.isCredentialer(account3.address)).to.equal(true);
      });

      it("Should be reverted because head doesn't have type clearance", async function () {
        const { otherAccount, skillswallet,account3} = await loadFixture(deploySkillsWalletFixture);
        await skillswallet.createCredentialType(credentialType)
        await skillswallet.createCredentialType(credentialType2)
        await skillswallet.addHead(otherAccount.address, credentialType)
        expect(await skillswallet.isHead(otherAccount.address)).to.equal(true);
        expect(await skillswallet.isCredentialer(otherAccount.address)).to.equal(true);
        await expect(skillswallet.connect(otherAccount).addCredentialer(account3.address, credentialType2)).to.be.revertedWith("Not cleared to modify current type")
        expect(await skillswallet.isCredentialer(account3.address)).to.equal(false);
      });

      it("Should be reverted because not head calling", async function () {
        const { otherAccount, skillswallet,owner } = await loadFixture(deploySkillsWalletFixture);
        await expect(skillswallet.connect(otherAccount).addCredentialer(otherAccount.address, credentialType)).to.be.revertedWith("Not an approved head");
      });
    });
    
    describe("Create Credential", function () {
      it("Should create a credential", async function () {
        const { otherAccount, skillswallet,account3} = await loadFixture(deploySkillsWalletFixture);
        await skillswallet.createCredentialType(credentialType)
        await skillswallet.addHead(otherAccount.address, credentialType)
        const uri = "firstCredential"
        const returnval = await skillswallet.connect(otherAccount).createCredential(credentialType,uri)
        expect(await skillswallet.uri(1)).to.equal("https://www.baseURI.com/firstCredential");
      });

      it("Should be reverted because head doesn't have type clearance", async function () {
        const { otherAccount, skillswallet,account3} = await loadFixture(deploySkillsWalletFixture);
        await skillswallet.createCredentialType(credentialType)
        await skillswallet.createCredentialType(credentialType2)
        await skillswallet.addHead(otherAccount.address, credentialType)
        const uri = "firstCredential"
        await expect(skillswallet.connect(otherAccount).createCredential(credentialType2,uri)).to.be.revertedWith("Don't have clearance for this credential type")
      });

      it("Should be reverted because not head calling", async function () {
        const { otherAccount, skillswallet,owner } = await loadFixture(deploySkillsWalletFixture);
        await expect(skillswallet.connect(otherAccount).addCredentialer(otherAccount.address, credentialType)).to.be.revertedWith("Not an approved head");
      });
    });

    async function createdCredentialFixture() {
      const { otherAccount, skillswallet,owner, account3, baseURI} = await loadFixture(deploySkillsWalletFixture);
      const account4 = (await ethers.getSigners())[3]
      await skillswallet.createCredentialType(credentialType)
      await skillswallet.createCredentialType(credentialType2)
      await skillswallet.addHead(otherAccount.address, credentialType)
      await skillswallet.connect(otherAccount).addCredentialer(account3.address, credentialType)
      await skillswallet.connect(owner).addCredentialer(account4.address,credentialType2)
      const uri = "firstCredential"
      await skillswallet.connect(otherAccount).createCredential(credentialType,uri)
      return {skillswallet, baseURI, owner, otherAccount, credentialType, account3, account4};
    }

    describe("Mint Credential", function () {
      it("Should Mint a credential", async function () {
        const { otherAccount, skillswallet,account3} = await loadFixture(createdCredentialFixture);
       await skillswallet.connect(account3).issueCredential(otherAccount.address,1);
        expect(await skillswallet.balanceOf(otherAccount.address, 1)).to.equal(1);
      });

      it("Should be reverted because head doesn't have type clearance", async function () {
        const { otherAccount, skillswallet,account4} = await loadFixture(createdCredentialFixture);
        await expect(skillswallet.connect(account4).issueCredential(otherAccount.address,1)).to.be.revertedWith("Don't have clearance for this credential type");
      });
    });

    /*describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { lock, unlockTime, lockedAmount } = await loadFixture(
          deployOneYearLockFixture
        );

        await time.increaseTo(unlockTime);

        await expect(lock.withdraw())
          .to.emit(lock, "Withdrawal")
          .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
      });
    });

    describe("Transfers", function () {
      it("Should transfer the funds to the owner", async function () {
        const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
          deployOneYearLockFixture
        );

        await time.increaseTo(unlockTime);

        await expect(lock.withdraw()).to.changeEtherBalances(
          [owner, lock],
          [lockedAmount, -lockedAmount]
        );
      });
    });*/
  });
});
