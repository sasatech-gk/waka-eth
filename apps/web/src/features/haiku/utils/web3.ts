import { ethers } from 'ethers';
import { WakaNFT__factory } from '@waka-eth/contracts/typechain-types/factories/contracts/WakaNFT__factory';

import type { Eip1193Provider } from 'ethers';

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return { provider, signer };
};

export const getWakaNFTContract = async (signer: ethers.Signer) => {
  const contractAddress = process.env.NEXT_PUBLIC_WAKA_NFT_ADDRESS;
  if (!contractAddress) {
    throw new Error('Contract address not configured');
  }

  return WakaNFT__factory.connect(contractAddress, signer);
};

export const createUpperVerse = async (
  signer: ethers.Signer,
  upperVerse: string,
  recipientAddress: string
) => {
  const contract = await getWakaNFTContract(signer);
  const tx = await contract.createUpperVerse(upperVerse, recipientAddress);
  const receipt = await tx.wait();
  
  if (receipt && receipt.logs.length > 0) {
    const event = contract.interface.parseLog({
      topics: receipt.logs[0].topics,
      data: receipt.logs[0].data,
    });
    if (event && event.name === 'UpperVerseCreated') {
      return {
        status: receipt.status,
        tokenId: event.args[0],
      };
    }
  }
  return { status: receipt?.status ?? 0, tokenId: null };
};

export const addLowerVerse = async (signer: ethers.Signer, tokenId: number, lowerVerse: string) => {
  const contract = await getWakaNFTContract(signer);
  const tx = await contract.addLowerVerse(tokenId, lowerVerse);
  const receipt = await tx.wait();
  
  if (receipt && receipt.logs.length > 0) {
    const event = contract.interface.parseLog({
      topics: receipt.logs[0].topics,
      data: receipt.logs[0].data,
    });
    if (event && event.name === 'LowerVerseAdded') {
      return {
        status: receipt.status,
        success: true,
      };
    }
  }
  return { status: receipt?.status ?? 0, success: false };
};

export const getVerse = async (signer: ethers.Signer, tokenId: number) => {
  const contract = await getWakaNFTContract(signer);
  return contract.getVerse(tokenId);
};

export const getUserNFTs = async (signer: ethers.Signer) => {
  const contract = await getWakaNFTContract(signer);
  const address = await signer.getAddress();
  
  // Get all UpperVerseCreated events where recipient is the current user
  const filter = contract.filters.UpperVerseCreated();
  const events = await contract.queryFilter(filter);
  
  const userNFTs = [];
  
  for (const event of events) {
    try {
      const tokenId = event.args[0];
      const verse = await contract.getVerse(tokenId);
      
      try {
        const owner = await contract.ownerOf(tokenId);
        // Only include NFTs owned by the user and without lower verse
        if (owner === address && !verse.isComplete) {
        userNFTs.push({
          tokenId: Number(tokenId),
          upperVerse: verse.upperVerse,
        });
        }
      } catch {
        // Skip burned or non-existent tokens
        continue;
      }
    } catch (err) {
      console.error('Error fetching NFT:', err);
      // Skip failed NFTs
      continue;
    }
  }
  
  return userNFTs;
};
