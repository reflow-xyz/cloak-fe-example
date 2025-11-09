'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useCloakSDK } from '@/hooks/use-cloak-sdk';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface BalanceCardProps {
  title: string;
  description: string;
  type: 'public' | 'private';
  mintAddress?: string;
  decimals?: number;
  symbol?: string;
}

export function BalanceCard({
  title,
  description,
  type,
  mintAddress = '11111111111111111111111111111112',
  decimals = 9,
  symbol = 'SOL'
}: BalanceCardProps) {
  const { sdk, wallet } = useCloakSDK();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<string>('0');
  const [utxoCount, setUtxoCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = async (forceRefresh = false) => {
    if (!wallet.connected || !wallet.publicKey) return;

    try {
      setIsLoading(true);

      if (type === 'public') {
        // Fetch public wallet balance
        const publicBalance = await connection.getBalance(wallet.publicKey);
        const balanceNum = publicBalance / LAMPORTS_PER_SOL;
        setBalance(balanceNum.toFixed(decimals));
        setUtxoCount(0);
      } else {
        // Fetch private pool balance
        if (!sdk) return;

        let balanceData;
        if (mintAddress === '11111111111111111111111111111112') {
          balanceData = await sdk.getSolBalance(undefined, forceRefresh);
        } else {
          balanceData = await sdk.getSplBalance(mintAddress, undefined, forceRefresh);
        }

        const balanceNum = balanceData.total.toNumber() / Math.pow(10, decimals);
        setBalance(balanceNum.toFixed(decimals));
        setUtxoCount(balanceData.count);
      }
    } catch (error: any) {
      console.error('Failed to fetch balance:', error);
      setBalance('Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (wallet.connected) {
      fetchBalance();
    }
  }, [sdk, wallet.connected, wallet.publicKey, mintAddress, type]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchBalance(true)}
            disabled={isLoading || !wallet.connected}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {wallet.connected ? balance : '---'} {symbol}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {wallet.connected
            ? type === 'private'
              ? `${utxoCount} UTXOs in pool`
              : 'Wallet balance'
            : 'Connect wallet to view balance'
          }
        </p>
      </CardContent>
    </Card>
  );
}
