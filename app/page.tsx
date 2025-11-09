'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { BalanceCard } from '@/components/balance-card';
import { DepositForm } from '@/components/deposit-form';
import { WithdrawForm } from '@/components/withdraw-form';
import { TransferForm } from '@/components/transfer-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

export default function Home() {
  const [balanceKey, setBalanceKey] = useState(0);

  const refreshBalances = () => {
    setBalanceKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Cloak Privacy Pool
            </h1>
            <p className="text-muted-foreground mt-2">
              Private transactions on Solana powered by zero-knowledge proofs
            </p>
          </div>
          <WalletMultiButton />
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <BalanceCard
            key={`public-${balanceKey}`}
            title="Public Balance"
            description="Your wallet's SOL balance"
            type="public"
            decimals={9}
            symbol="SOL"
          />
          <BalanceCard
            key={`private-${balanceKey}`}
            title="Private Balance"
            description="Your balance in the privacy pool"
            type="private"
            decimals={9}
            symbol="SOL"
          />
        </div>

        {/* Action Tabs */}
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="mt-6">
            <DepositForm onSuccess={refreshBalances} />
          </TabsContent>

          <TabsContent value="withdraw" className="mt-6">
            <WithdrawForm onSuccess={refreshBalances} />
          </TabsContent>

          <TabsContent value="transfer" className="mt-6">
            <TransferForm onSuccess={refreshBalances} />
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <div className="mt-12 p-6 bg-white dark:bg-zinc-950 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">How it works</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <strong>Deposit:</strong> Move SOL from your public wallet into the privacy pool
            </li>
            <li>
              <strong>Withdraw:</strong> Move SOL from the privacy pool to any address privately
            </li>
            <li>
              <strong>Transfer:</strong> Deposit and withdraw in one flow for private transfers
            </li>
            <li>
              All transactions use zero-knowledge proofs to ensure privacy while maintaining security
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
