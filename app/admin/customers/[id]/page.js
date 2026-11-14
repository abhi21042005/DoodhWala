// Rendering Strategy: SSR (Dynamic Server-Side Rendering)
// Customer detail page displaying profile, active subscription, and entire transaction history ledger.

import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import prisma from '@/lib/prisma';
import { formatRupees } from '@/lib/money';
import { formatDateFull } from '@/lib/dates';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  return {
    title: user ? `${user.name} - Customer Ledger` : 'Customer Not Found',
  };
}

export default async function CustomerDetailPage({ params }) {
  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      subscriptions: {
        include: {
          product: true,
          days: true,
          pauses: true,
        },
      },
      walletTransactions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const sub = customer.subscriptions[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/customers"
          className="text-xs font-semibold text-green-deep hover:underline inline-flex items-center gap-1"
        >
          ← Back to All Customers
        </Link>
      </div>

      {/* Customer Header Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
              Customer Account
            </span>
            <h1 className="text-2xl font-bold font-serif text-gray-900 mt-0.5">
              {customer.name}
            </h1>
            <p className="text-xs text-gray-500">
              Registered {formatDateFull(customer.createdAt)} • {customer.area}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono uppercase text-gray-400 block">
              Current Balance
            </span>
            <span className="text-3xl font-bold font-mono text-green-deep">
              {formatRupees(customer.walletBalance)}
            </span>
          </div>
        </div>

        {/* Contact and address grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div>
            <span className="text-gray-400 uppercase font-semibold block">Phone</span>
            <span className="font-mono text-gray-800 text-sm">{customer.phone}</span>
          </div>
          <div>
            <span className="text-gray-400 uppercase font-semibold block">Email</span>
            <span className="text-gray-800 text-sm">{customer.email}</span>
          </div>
          <div>
            <span className="text-gray-400 uppercase font-semibold block">Delivery Address</span>
            <span className="text-gray-800 text-sm">{customer.address}</span>
          </div>
        </div>
      </Card>

      {/* Subscription Breakdown */}
      {sub && (
        <Card className="p-5">
          <h2 className="text-base font-bold font-serif text-gray-900 mb-3">
            Active Milk Subscription
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-400 uppercase block">Product</span>
              <strong className="text-gray-900 text-sm">{sub.product.name}</strong>
            </div>
            <div>
              <span className="text-gray-400 uppercase block">Price</span>
              <strong className="font-mono text-gray-900 text-sm">
                {formatRupees(sub.product.pricePerLitre)}/L
              </strong>
            </div>
            <div>
              <span className="text-gray-400 uppercase block">Status</span>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-green-light text-green-deep">
                {sub.status}
              </span>
            </div>
            <div>
              <span className="text-gray-400 uppercase block">Active Pauses</span>
              <span className="text-gray-900 font-semibold">{sub.pauses.length} records</span>
            </div>
          </div>
        </Card>
      )}

      {/* Wallet Ledger */}
      <Card className="overflow-hidden">
        <Card.Header>
          <span className="font-serif font-bold text-gray-900">
            Wallet Transaction Ledger ({customer.walletTransactions.length} entries)
          </span>
        </Card.Header>

        {customer.walletTransactions.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No transactions found for this customer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {customer.walletTransactions.map((tx) => {
                  const isCredit = tx.type === 'CREDIT';
                  return (
                    <tr key={tx.id} className="hover:bg-cream-dark/30">
                      <td className="py-3 px-4 text-xs font-mono text-gray-500 whitespace-nowrap">
                        {format(tx.createdAt, 'd MMM yyyy, h:mm a')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                            isCredit
                              ? 'bg-green-light text-green-deep'
                              : 'bg-terracotta-light text-terracotta'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-800">
                        {tx.description}
                      </td>
                      <td
                        className={`py-3 px-4 text-xs font-mono font-bold text-right whitespace-nowrap ${
                          isCredit ? 'text-green-deep' : 'text-terracotta'
                        }`}
                      >
                        {isCredit ? '+' : '-'} {formatRupees(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono font-medium text-gray-900 text-right whitespace-nowrap">
                        {formatRupees(tx.balanceAfter)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
