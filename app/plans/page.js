// Rendering Strategy: ISR (Incremental Static Regeneration)
// Cached statically and automatically revalidated every 60 seconds (or on-demand when admin updates prices).

import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import prisma from '@/lib/prisma';
import { formatRupees } from '@/lib/money';

export const revalidate = 60; // revalidate at most once every minute

export const metadata = {
  title: 'Milk Plans & Pricing - Desi & A2 Gir Cow Milk',
  description:
    'Compare pure Desi Cow and A2 Gir Cow milk prices and nutrition. Transparent daily rates with flexible subscription plans.',
};

export default async function PlansPage() {
  const products = await prisma.milkProduct.findMany({
    where: { active: true },
    orderBy: { pricePerLitre: 'asc' },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-green-deep font-semibold">
          Daily Pricing & Plans
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900">
          Pure Cow Milk Varieties
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          All our milk is 100% whole, unadulterated, raw milk chilled instantly at 4°C. Glass bottled and delivered before 7:00 AM.
        </p>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {products.map((product) => {
          const isA2 = product.name.includes('A2');
          return (
            <Card
              key={product.id}
              className={`p-6 sm:p-8 flex flex-col justify-between relative ${
                isA2 ? 'border-2 border-green-mid shadow-md' : 'border border-gray-200'
              }`}
            >
              {isA2 && (
                <span className="absolute -top-3 right-6 bg-green-deep text-white text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                  Customer Favourite
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-gray-900">
                    {product.name}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {isA2
                      ? 'Pure Gir breed with native A2 beta-casein protein'
                      : 'Indigenous Sahiwal & Haryana breed desi cows'}
                  </p>
                </div>

                <div className="py-4 border-y border-gray-100 flex items-baseline gap-2">
                  <span className="text-4xl font-bold font-serif text-gray-900">
                    {formatRupees(product.pricePerLitre)}
                  </span>
                  <span className="text-sm text-gray-500">/ litre</span>
                </div>

                {/* Features list */}
                <ul className="space-y-2.5 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-mid font-bold">✓</span>
                    <span>{isA2 ? 'A2 Beta-Casein Protein (easier on gut)' : 'Rich native whole milk protein'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-mid font-bold">✓</span>
                    <span>{isA2 ? '4.5% - 5.0% natural butter fat' : '4.0% - 4.2% natural fat (thick malai)'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-mid font-bold">✓</span>
                    <span>Grass & green fodder fed, zero synthetic supplements</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-mid font-bold">✓</span>
                    <span>Sterilised glass bottles delivered cold</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-mid font-bold">✓</span>
                    <span>Adjust daily quantity (0.5 L to 5.0 L)</span>
                  </li>
                </ul>

                {/* Estimated Monthly Sample */}
                <div className="bg-cream-dark p-3 rounded-lg text-xs text-gray-700 space-y-1">
                  <span className="font-semibold text-gray-900 block">Sample Monthly Cost:</span>
                  <div className="flex justify-between">
                    <span>1.0 L / day (30 days):</span>
                    <strong className="font-mono">{formatRupees(product.pricePerLitre * 30)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>1.5 L / day (30 days):</span>
                    <strong className="font-mono">{formatRupees(product.pricePerLitre * 1.5 * 30)}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <Link href="/register">
                  <Button
                    variant={isA2 ? 'primary' : 'secondary'}
                    size="lg"
                    className="w-full"
                  >
                    Subscribe to {product.name}
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Comparison table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 overflow-x-auto">
        <h3 className="font-serif font-bold text-lg text-gray-900 mb-4">
          Detailed Comparison
        </h3>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
              <th className="py-3 px-4">Parameter</th>
              <th className="py-3 px-4">Desi Cow Milk</th>
              <th className="py-3 px-4">A2 Gir Cow Milk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            <tr>
              <td className="py-3 px-4 font-medium text-gray-900">Cow Breed</td>
              <td className="py-3 px-4">Sahiwal / Haryana Native</td>
              <td className="py-3 px-4">Gir Native (Gujarat origin)</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-gray-900">Protein Type</td>
              <td className="py-3 px-4">Standard native casein</td>
              <td className="py-3 px-4">100% Certified A2 Beta-Casein</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-gray-900">Digestion Comfort</td>
              <td className="py-3 px-4">Gentle on adults</td>
              <td className="py-3 px-4">Ideal for children & sensitive stomachs</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-gray-900">Milking Method</td>
              <td className="py-3 px-4">Automatic milking machine</td>
              <td className="py-3 px-4">Automatic milking machine</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-gray-900">Packaging</td>
              <td className="py-3 px-4">Food-grade glass bottle</td>
              <td className="py-3 px-4">Food-grade glass bottle</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
