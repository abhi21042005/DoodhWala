// Rendering Strategy: SSR (Dynamic Server-Side Rendering)
// Admin price management demonstrating React Uncontrolled Components with DOM Refs.

import Card from '@/components/ui/Card';
import ProductPriceForm from '@/features/admin/ProductPriceForm';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Milk Pricing Management',
  description: 'Update daily per-litre rates for Desi Cow and A2 Gir cow milk.',
};

export default async function AdminProductsPage() {
  const products = await prisma.milkProduct.findMany({
    orderBy: { pricePerLitre: 'asc' },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold font-serif text-gray-900">
          Milk Variety Rates & Pricing
        </h2>
        <p className="text-xs text-gray-600 mt-0.5">
          Update prices per litre across the dairy system. Changes immediately revalidate public plan pages and future estimates.
        </p>
      </div>

      <div className="p-4 bg-cream-dark rounded-xl border border-gray-300 text-xs text-gray-700">
        <strong className="block text-gray-900 font-semibold mb-1">
          Syllabus Feature Note: Uncontrolled Form with Refs
        </strong>
        The forms below deliberately use React <code className="bg-white px-1.5 py-0.5 rounded font-mono">useRef</code> to read input values directly from the DOM rather than binding each keystroke to component state, fulfilling the INT252 requirement for both controlled and uncontrolled form paradigms.
      </div>

      <div className="space-y-6">
        {products.map((product) => (
          <ProductPriceForm key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
