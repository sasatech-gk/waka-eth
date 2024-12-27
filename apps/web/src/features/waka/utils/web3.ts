import { ethers } from 'ethers';

// ABI for the WakaNFT contract
const WakaNFTABI = [
  "function createUpperVerse(string memory _upperVerse) public returns (uint256)",
  "function addLowerVerse(uint256 _tokenId, string memory _lowerVerse) public",
  "function getVerse(uint256 _tokenId) public view returns (string memory upperVerse, string memory lowerVerse, address upperCreator, address lowerCreator, bool isComplete)",
  "event UpperVerseCreated(uint256 indexed tokenId, address creator, string upperVerse)",
  "event LowerVerseAdded(uint256 indexed tokenId, address creator, string lowerVerse)",
  "event WakaCompleted(uint256 indexed tokenId, address upperCreator, address lowerCreator)"
];

// Contract address will be set after deployment
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_WAKA_NFT_ADDRESS || '';

/**
 * Get an ethers provider instance
 */
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    // Use MetaMask provider if available
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Fallback to a JSON-RPC provider (for development)
  return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545');
};

/**
 * Get contract instance with a signer or provider
 */
export const getContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, WakaNFTABI, signerOrProvider);
};

/**
 * Verify a message signature
 */
export const verifySignature = (message: string, signature: string, expectedSigner: string): boolean => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedSigner.toLowerCase();
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

/**
 * Create upper verse and get token ID
 */
export const createUpperVerse = async (
  signer: ethers.Signer,
  upperVerse: string
): Promise<{ tokenId: string; txHash: string }> => {
  const contract = getContract(signer);
  const tx = await contract.createUpperVerse(upperVerse);
  const receipt = await tx.wait();
  
  // Get tokenId from the UpperVerseCreated event
  const event = receipt.logs.find(
    (log: any) => log.fragment?.name === 'UpperVerseCreated'
  );
  const tokenId = event?.args?.[0].toString();

  return {
    tokenId,
    txHash: receipt.hash
  };
};

/**
 * Add lower verse and mint NFT
 */
export const addLowerVerse = async (
  signer: ethers.Signer,
  tokenId: string,
  lowerVerse: string
): Promise<{ txHash: string }> => {
  const contract = getContract(signer);
  const tx = await contract.addLowerVerse(tokenId, lowerVerse);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash
  };
};

/**
 * Get verse information
 */
export const getVerse = async (
  provider: ethers.Provider,
  tokenId: string
) => {
  const contract = getContract(provider);
  const verse = await contract.getVerse(tokenId);
  
  return {
    upperVerse: verse[0],
    lowerVerse: verse[1],
    upperCreator: verse[2],
    lowerCreator: verse[3],
    isComplete: verse[4]
  };
};

// Types for TypeScript support
export interface VerseData {
  upperVerse: string;
  lowerVerse: string;
  upperCreator: string;
  lowerCreator: string;
  isComplete: boolean;
}

export interface TransactionResult {
  txHash: string;
  tokenId?: string;
}
