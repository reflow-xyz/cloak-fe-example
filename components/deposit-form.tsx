'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCloakSDK } from '@/hooks/use-cloak-sdk';
import { toast } from 'sonner';

interface DepositFormProps {
  onSuccess?: () => void;
}

export function DepositForm({ onSuccess }: DepositFormProps) {
  const { sdk, wallet } = useCloakSDK();
  const [amount, setAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [status, setStatus] = useState('');

  const handleDeposit = async () => {
    if (!sdk || !wallet.connected || !wallet.publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setIsDepositing(true);
      setStatus('Creating deposit transaction...');

      const result = await sdk.depositSol({
        amount: parseFloat(amount),
        onStatus: (statusMsg: string) => {
          setStatus(statusMsg);
          console.log(statusMsg);
        },
      });

      if (result.success) {
        toast.success(`Deposit successful! Signature: ${result.signature?.substring(0, 8)}...`);
        setAmount('');
        setStatus('');
        onSuccess?.();
      } else {
        toast.error(`Deposit failed: ${result.error}`);
        setStatus('');
      }
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(`Deposit failed: ${error.message || 'Unknown error'}`);
      setStatus('');
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit to Privacy Pool</CardTitle>
        <CardDescription>
          Deposit SOL into the Cloak privacy pool
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="deposit-amount" className="text-sm font-medium">
            Amount (SOL)
          </label>
          <Input
            id="deposit-amount"
            type="number"
            step="0.001"
            placeholder="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isDepositing || !wallet.connected}
          />
        </div>

        {status && (
          <div className="text-sm text-muted-foreground">
            {status}
          </div>
        )}

        <Button
          onClick={handleDeposit}
          disabled={isDepositing || !wallet.connected || !amount}
          className="w-full"
        >
          {isDepositing ? 'Depositing...' : 'Deposit SOL'}
        </Button>
      </CardContent>
    </Card>
  );
}
