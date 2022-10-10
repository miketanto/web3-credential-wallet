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
  async function deploySkillsWalletFixture() {
    const baseURI = "https://www.baseURI.com/"


    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const SkillsWallet = await ethers.getContractFactory("SkillsWallet");
    const skillswallet = await SkillsWallet.deploy(baseURI,owner.address);

    return {skillswallet, baseURI, owner, otherAccount};
  }

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      const { skillswallet, owner } = await loadFixture(deploySkillsWalletFixture);

      expect(await skillswallet.isCredentialer(owner.address)).to.equal(true);
    });
  });

  async function basicSetupFixture() {
    const { otherAccount, skillswallet,owner, baseURI} = await loadFixture(deploySkillsWalletFixture);
    const credentialType = "Math";
    await skillswallet.createCredentialType(credentialType)
    await skillswallet.addCredentialer(otherAccount.address, credentialType)
    return {skillswallet, baseURI, owner, otherAccount, credentialType};
  }

  describe("Setup", function () {

    describe("Credentialer", function () {
      const credentialType = "Math";
      it("Should add a credentialer", async function () {
        const { otherAccount, skillswallet,owner } = await loadFixture(deploySkillsWalletFixture);
        await skillswallet.createCredentialType(credentialType)
        await skillswallet.addCredentialer(otherAccount.address, credentialType)
        expect(await skillswallet.isCredentialer(otherAccount.address)).to.equal(true);
      });

      it("Should be reverted because not a proper credential type", async function () {
        const { otherAccount, skillswallet,owner } = await loadFixture(deploySkillsWalletFixture);
        await expect(skillswallet.addCredentialer(otherAccount.address, credentialType)).to.be.revertedWith("Clearance type does not exist.");
      });

      it("Should be reverted because not admin", async function () {
        const { otherAccount, skillswallet,owner } = await loadFixture(deploySkillsWalletFixture);
        await expect(skillswallet.connect(otherAccount).addCredentialer(otherAccount.address, credentialType)).to.be.revertedWith("Not the contract admin");
      });
    });

    describe("Create Credential", function () {
      it("Should create a Credential", async function () {
        const { otherAccount, skillswallet,credentialType} = await loadFixture(basicSetupFixture);
        const uri = "firstCredential"
        const returnval = await skillswallet.connect(otherAccount).createCredential(credentialType,uri)
        expect(returnval.value).to.equal(0);
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
