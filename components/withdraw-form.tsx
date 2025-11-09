'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCloakSDK } from '@/hooks/use-cloak-sdk';
import { toast } from 'sonner';
import { PublicKey } from '@solana/web3.js';

interface WithdrawFormProps {
  onSuccess?: () => void;
}

export function WithdrawForm({ onSuccess }: WithdrawFormProps) {
  const { sdk, wallet } = useCloakSDK();
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [status, setStatus] = useState('');

  const handleWithdraw = async () => {
    if (!sdk || !wallet.connected || !wallet.publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!recipientAddress) {
      toast.error('Please enter a recipient address');
      return;
    }

    try {
      setIsWithdrawing(true);
      setStatus('Creating withdrawal transaction...');

      const result = await sdk.withdrawSol({
        amount: parseFloat(amount),
        recipientAddress: new PublicKey(recipientAddress),
        onStatus: (statusMsg: string) => {
          setStatus(statusMsg);
          console.log(statusMsg);
        },
      });

      if (result.success) {
        toast.success(`Withdrawal successful! Signature: ${result.signature?.substring(0, 8)}...`);
        setAmount('');
        setRecipientAddress('');
        setStatus('');
        onSuccess?.();
      } else {
        toast.error(`Withdrawal failed: ${result.error}`);
        setStatus('');
      }
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error(`Withdrawal failed: ${error.message || 'Unknown error'}`);
      setStatus('');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw from Privacy Pool</CardTitle>
        <CardDescription>
          Withdraw SOL from the Cloak privacy pool
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="withdraw-amount" className="text-sm font-medium">
            Amount (SOL)
          </label>
          <Input
            id="withdraw-amount"
            type="number"
            step="0.001"
            placeholder="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isWithdrawing || !wallet.connected}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="recipient-address" className="text-sm font-medium">
            Recipient Address
          </label>
          <Input
            id="recipient-address"
            type="text"
            placeholder="Solana address..."
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            disabled={isWithdrawing || !wallet.connected}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => wallet.publicKey && setRecipientAddress(wallet.publicKey.toString())}
            disabled={!wallet.connected}
            className="text-xs"
          >
            Use my address
          </Button>
        </div>

        {status && (
          <div className="text-sm text-muted-foreground">
            {status}
          </div>
        )}

        <Button
          onClick={handleWithdraw}
          disabled={isWithdrawing || !wallet.connected || !amount || !recipientAddress}
          className="w-full"
        >
          {isWithdrawing ? 'Withdrawing...' : 'Withdraw SOL'}
        </Button>
      </CardContent>
    </Card>
  );
}
