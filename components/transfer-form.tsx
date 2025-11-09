'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCloakSDK } from '@/hooks/use-cloak-sdk';
import { toast } from 'sonner';
import { PublicKey } from '@solana/web3.js';

interface TransferFormProps {
  onSuccess?: () => void;
}

export function TransferForm({ onSuccess }: TransferFormProps) {
  const { sdk, wallet } = useCloakSDK();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [status, setStatus] = useState('');

  const handleTransfer = async () => {
    if (!sdk || !wallet.connected || !wallet.publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid deposit amount');
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }

    if (!recipientAddress) {
      toast.error('Please enter a recipient address');
      return;
    }

    try {
      setIsTransferring(true);
      setStatus('Initiating private transfer...');

      const result = await sdk.fullTransfer({
        depositAmount: parseFloat(depositAmount),
        withdrawAmount: parseFloat(withdrawAmount),
        recipientAddress: new PublicKey(recipientAddress),
        onStatus: (statusMsg: string) => {
          setStatus(statusMsg);
          console.log(statusMsg);
        },
      });

      if (result.depositResult.success && result.withdrawResult.success) {
        toast.success('Private transfer completed successfully!');
        setDepositAmount('');
        setWithdrawAmount('');
        setRecipientAddress('');
        setStatus('');
        onSuccess?.();
      } else {
        if (!result.depositResult.success) {
          toast.error(`Deposit failed: ${result.depositResult.error}`);
        } else {
          toast.error(`Withdrawal failed: ${result.withdrawResult.error}`);
        }
        setStatus('');
      }
    } catch (error: any) {
      console.error('Transfer error:', error);
      toast.error(`Transfer failed: ${error.message || 'Unknown error'}`);
      setStatus('');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Private Transfer</CardTitle>
        <CardDescription>
          Deposit, then withdraw to a recipient address in one transaction flow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="deposit-amount" className="text-sm font-medium">
            Deposit Amount (SOL)
          </label>
          <Input
            id="deposit-amount"
            type="number"
            step="0.001"
            placeholder="0.01"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            disabled={isTransferring || !wallet.connected}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="withdraw-amount" className="text-sm font-medium">
            Withdraw Amount (SOL)
          </label>
          <Input
            id="withdraw-amount"
            type="number"
            step="0.001"
            placeholder="0.005"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            disabled={isTransferring || !wallet.connected}
          />
          <p className="text-xs text-muted-foreground">
            Remaining balance will stay in privacy pool
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="transfer-recipient" className="text-sm font-medium">
            Recipient Address
          </label>
          <Input
            id="transfer-recipient"
            type="text"
            placeholder="Solana address..."
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            disabled={isTransferring || !wallet.connected}
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
          onClick={handleTransfer}
          disabled={isTransferring || !wallet.connected || !depositAmount || !withdrawAmount || !recipientAddress}
          className="w-full"
        >
          {isTransferring ? 'Processing Transfer...' : 'Execute Private Transfer'}
        </Button>
      </CardContent>
    </Card>
  );
}
