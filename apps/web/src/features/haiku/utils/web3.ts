import { ethers } from 'ethers';
import { WakaNFT__factory } from '@waka-eth/contracts/typechain-types';

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
  return receipt;
};

export const addLowerVerse = async (signer: ethers.Signer, tokenId: number, lowerVerse: string) => {
  const contract = await getWakaNFTContract(signer);
  const tx = await contract.addLowerVerse(tokenId, lowerVerse);
  const receipt = await tx.wait();
  return receipt;
};

export const getVerse = async (signer: ethers.Signer, tokenId: number) => {
  const contract = await getWakaNFTContract(signer);
  return contract.getVerse(tokenId);
};
