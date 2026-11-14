'use client';

// transaction ledger table with semantic HTML, indian currency formatting, and empty states
import Card from '@/components/ui/Card';
import { formatRupees } from '@/lib/money';
import { format, parseISO } from 'date-fns';

export default function TransactionTable({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-gray-500">No transactions recorded yet.</p>
        <p className="text-xs text-gray-400 mt-1">
          When you add money or milk is delivered, the ledger entries will appear here.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Card.Header>
        <span className="font-serif font-bold text-gray-900">Transaction History</span>
      </Card.Header>

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
            {transactions.map((tx) => {
              const isCredit = tx.type === 'CREDIT';
              const formattedDate = format(
                typeof tx.createdAt === 'string' ? parseISO(tx.createdAt) : tx.createdAt,
                'd MMM yyyy, h:mm a'
              );

              return (
                <tr key={tx.id} className="hover:bg-cream-dark/30 transition-colors">
                  <td className="py-3 px-4 text-xs text-gray-500 font-mono whitespace-nowrap">
                    {formattedDate}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                        isCredit
                          ? 'bg-green-light text-green-deep border border-green-mid/30'
                          : 'bg-terracotta-light text-terracotta border border-terracotta/30'
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
    </Card>
  );
}
