'use client';

// Rendering Strategy: CSR (Client-Side Rendering)
// Relies on useWalletBalance custom hook, React Query background refetching, and top-up form.

import { useWalletBalance } from '@/features/wallet/useWalletBalance';
import TopUpForm from '@/features/wallet/TopUpForm';
import TransactionTable from '@/features/wallet/TransactionTable';
import Card from '@/components/ui/Card';
import { formatRupees } from '@/lib/money';

export default function WalletPage() {
  const { balance, daysLeft, transactions, product, isLoading, refetch } =
    useWalletBalance();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-gray-900">
          Prepaid Milk Wallet
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Add money to your account. Each delivered morning deducts automatically.
        </p>
      </div>

      {/* Top metrics summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Current Balance */}
        <Card className="p-5 sm:p-6 bg-gradient-to-br from-white to-cream-dark">
          <span className="text-xs font-mono uppercase tracking-wider text-gray-500 font-semibold block">
            Current Wallet Balance
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold font-serif text-green-deep">
              {isLoading ? '...' : formatRupees(balance)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            No subscription fees. 100% of your top-up goes directly to your milk deliveries.
          </p>
        </Card>

        {/* Days Left Projection */}
        <Card className="p-5 sm:p-6 bg-cream-dark border-gray-300">
          <span className="text-xs font-mono uppercase tracking-wider text-terracotta font-semibold block">
            Estimated Milk Coverage
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold font-serif text-gray-900">
              {isLoading
                ? '...'
                : daysLeft === Infinity
                ? 'Unlimited'
                : `${daysLeft} days`}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {product
              ? `Based on your ${product.name} subscription plan.`
              : 'Set up your weekly planner to see precise coverage.'}
          </p>
        </Card>
      </div>

      {/* Top up form & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <TopUpForm onSuccess={() => refetch()} />
        </div>

        <div className="lg:col-span-7">
          <TransactionTable transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
