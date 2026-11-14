// Rendering Strategy: SSR (Dynamic Server-Side Rendering)
// Lists all registered dairy subscribers with live balances and subscription plans.

import Link from 'next/link';
import Card from '@/components/ui/Card';
import prisma from '@/lib/prisma';
import { formatRupees } from '@/lib/money';
import { formatDateFull } from '@/lib/dates';

export const metadata = {
  title: 'Customer Directory & Balances',
  description: 'Manage subscribers, view wallet ledgers, and check delivery addresses.',
};

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    include: {
      subscriptions: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-serif text-gray-900">
            Subscriber Directory ({customers.length} Customers)
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            View customer details, current wallet balance, and delivery history.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Area & Address</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Milk Variety</th>
                <th className="py-3 px-4 text-right">Wallet Balance</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {customers.map((c) => {
                const sub = c.subscriptions[0];
                const isLow = c.walletBalance < 150;

                return (
                  <tr key={c.id} className="hover:bg-cream-dark/30">
                    <td className="py-3 px-4">
                      <strong className="block text-gray-900 font-serif">{c.name}</strong>
                      <span className="text-[11px] text-gray-400">
                        Joined {formatDateFull(c.createdAt)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs max-w-xs">
                      <span className="font-semibold text-gray-800 block">{c.area}</span>
                      <span className="text-gray-500 truncate block">{c.address}</span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className="font-mono text-gray-800 block">{c.phone}</span>
                      <span className="text-gray-400 block">{c.email}</span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className="font-medium text-gray-800">
                        {sub?.product?.name || 'No Plan'}
                      </span>
                      <span className="text-gray-400 block text-[11px]">
                        Status: {sub?.status || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                      <span className={isLow ? 'text-red-soft' : 'text-green-deep'}>
                        {formatRupees(c.walletBalance)}
                      </span>
                      {isLow && (
                        <span className="block text-[10px] text-red-soft font-sans">
                          Low balance
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="text-xs font-semibold text-green-deep hover:underline px-2.5 py-1 rounded bg-green-light"
                      >
                        Ledger →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
