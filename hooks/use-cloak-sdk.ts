'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import { CloakSDK } from '@cloak-labs/sdk';

let sdkInstance: CloakSDK | null = null;
let sdkInitialized = false;
let lastWalletPubkey: string | null = null;

export function useCloakSDK() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [sdk, setSdk] = useState<CloakSDK | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeSDK = useCallback(async () => {
    // If wallet not connected or doesn't support signing, don't initialize
    if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
      return;
    }

    const currentWalletPubkey = wallet.publicKey.toString();

    // If SDK exists and wallet hasn't changed, reuse it
    if (sdkInstance && sdkInitialized && lastWalletPubkey === currentWalletPubkey) {
      setSdk(sdkInstance);
      return sdkInstance;
    }

    try {
      setIsInitializing(true);
      setError(null);

      // Pass the wallet adapter directly to the SDK
      // The SDK will handle signature generation internally
      const relayerUrl = process.env.NEXT_PUBLIC_RELAYER_API_URL || 'https://dev-api.cloaklabs.dev';

      console.log('[SDK] Initializing with relayer URL:', relayerUrl);
      console.log('[SDK] Circuit path:', '/circuits/circuit2');

      sdkInstance = new CloakSDK({
        connection,
        signer: wallet as any, // Wallet adapter with signTransaction
        verbose: false,
        relayerUrl,
        circuitPath: '/circuits/circuit2',
      });

      await sdkInstance.initialize();
      sdkInitialized = true;
      lastWalletPubkey = currentWalletPubkey;
      setSdk(sdkInstance);
      setIsInitializing(false);

      return sdkInstance;
    } catch (err: any) {
      setError(err.message || 'Failed to initialize SDK');
      setIsInitializing(false);
      throw err;
    }
  }, [connection, wallet]);

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      initializeSDK();
    } else {
      // Reset SDK when wallet disconnects
      setSdk(null);
      sdkInstance = null;
      sdkInitialized = false;
      lastWalletPubkey = null;
    }
  }, [wallet.connected, wallet.publicKey, initializeSDK]);

  return {
    sdk,
    isInitializing,
    error,
    wallet,
  };
}
