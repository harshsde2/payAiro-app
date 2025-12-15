/**
 * Detects if a given identifier is a blockchain name service address
 * @param identifier - The input string to check
 * @returns Object with type ('ens' | 'sns' | null) and boolean isBlockchainNameService
 */
export const detectBlockchainNameService = (identifier: string): {
  type: 'ens' | 'sns' | null;
  isBlockchainNameService: boolean;
} => {
  if (!identifier || typeof identifier !== 'string') {
    return { type: null, isBlockchainNameService: false };
  }

  const trimmed = identifier.trim().toLowerCase();

  // Ethereum Name Service (ENS) - ends with .eth
  if (trimmed.endsWith('.eth')) {
    // Basic validation: should be at least 4 characters (e.g., "a.eth")
    // and should not contain spaces or invalid characters
    const ensPattern = /^[a-z0-9-]+\.eth$/;
    if (ensPattern.test(trimmed)) {
      return { type: 'ens', isBlockchainNameService: true };
    }
  }

  // Solana Name Service (SNS) - ends with .sol
  if (trimmed.endsWith('.sol')) {
    // Basic validation: should be at least 4 characters (e.g., "a.sol")
    // and should not contain spaces or invalid characters
    const snsPattern = /^[a-z0-9-]+\.sol$/;
    if (snsPattern.test(trimmed)) {
      return { type: 'sns', isBlockchainNameService: true };
    }
  }

  return { type: null, isBlockchainNameService: false };
};

