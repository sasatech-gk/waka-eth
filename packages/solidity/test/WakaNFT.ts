import { expect } from "chai";
import { ethers } from "hardhat";
import { WakaNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("WakaNFT", function () {
  let wakaNFT: WakaNFT;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const WakaNFT = await ethers.getContractFactory("WakaNFT");
    wakaNFT = await WakaNFT.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await wakaNFT.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await wakaNFT.name()).to.equal("WakaNFT");
      expect(await wakaNFT.symbol()).to.equal("WAKA");
    });
  });

  describe("Verse Creation", function () {
    const upperVerse = "春過ぎて";
    const lowerVerse = "夏来にけらし";

    it("Should create upper verse correctly", async function () {
      const tx = await wakaNFT.connect(addr1).createUpperVerse(upperVerse);
      const receipt = await tx.wait();

      // Get the tokenId from events
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "UpperVerseCreated"
      );
      expect(event).to.not.be.undefined;

      const tokenId = event?.args?.[0];
      const verse = await wakaNFT.getVerse(tokenId);

      expect(verse.upperVerse).to.equal(upperVerse);
      expect(verse.upperCreator).to.equal(addr1.address);
      expect(verse.isComplete).to.be.false;
    });

    it("Should add lower verse and complete waka correctly", async function () {
      const tx1 = await wakaNFT.connect(addr1).createUpperVerse(upperVerse);
      const receipt1 = await tx1.wait();
      const event = receipt1?.logs.find(
        (log: any) => log.fragment?.name === "UpperVerseCreated"
      );
      const tokenId = event?.args?.[0];

      await wakaNFT.connect(addr2).addLowerVerse(tokenId, lowerVerse);

      const verse = await wakaNFT.getVerse(tokenId);
      expect(verse.lowerVerse).to.equal(lowerVerse);
      expect(verse.lowerCreator).to.equal(addr2.address);
      expect(verse.isComplete).to.be.true;

      // Check NFT ownership
      expect(await wakaNFT.ownerOf(tokenId)).to.equal(addr1.address);
    });

    it("Should not allow adding lower verse to non-existent token", async function () {
      await expect(
        wakaNFT.connect(addr2).addLowerVerse(999, lowerVerse)
      ).to.be.revertedWith("Token ID does not exist");
    });

    it("Should not allow adding lower verse to completed waka", async function () {
      const tx = await wakaNFT.connect(addr1).createUpperVerse(upperVerse);
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "UpperVerseCreated"
      );
      const tokenId = event?.args?.[0];

      await wakaNFT.connect(addr2).addLowerVerse(tokenId, lowerVerse);

      await expect(
        wakaNFT.connect(addr2).addLowerVerse(tokenId, "新しい下の句")
      ).to.be.revertedWith("Waka is already complete");
    });
  });
});
