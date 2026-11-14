'use client';

// uncontrolled form component using React refs
// INT252 Requirement: Uncontrolled form using refs instead of useState to manage input value directly from DOM
import { useRef, useTransition, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatRupees } from '@/lib/money';
import { updateProductPriceAction } from './actions';
import { useUiStore } from '@/stores/uiStore';

export default function ProductPriceForm({ product, onUpdated }) {
  // uncontrolled input ref
  const priceInputRef = useRef(null);
  const noteInputRef = useRef(null);

  const [error, setError] = useState('');
  const [currentPrice, setCurrentPrice] = useState(product.pricePerLitre);
  const [isPending, startTransition] = useTransition();
  const addToast = useUiStore((s) => s.addToast);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // extract value directly from DOM node via ref (uncontrolled)
    const newPriceVal = priceInputRef.current?.value;
    const adminNote = noteInputRef.current?.value;

    if (!newPriceVal) {
      setError('Please enter a valid price.');
      return;
    }

    startTransition(async () => {
      const res = await updateProductPriceAction(product.id, newPriceVal);
      if (res.success) {
        setCurrentPrice(res.product.pricePerLitre);
        addToast(`Price for ${product.name} updated to ₹${res.product.pricePerLitre}/L`, 'success');
        if (onUpdated) onUpdated();
      } else {
        setError(res.error || 'Failed to update price');
        addToast(res.error || 'Failed to update', 'error');
      }
    });
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
        <div>
          <h3 className="text-xl font-bold font-serif text-gray-900">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500">
            Uncontrolled form pattern with DOM refs
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-mono text-gray-400 block">
            Current Rate
          </span>
          <span className="text-2xl font-bold font-mono text-green-deep">
            {formatRupees(currentPrice)} / L
          </span>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 p-3 rounded-lg bg-red-light border border-red-soft text-sm text-red-soft"
        >
          {error}
        </div>
      )}

      {/* Uncontrolled Form */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={`price-${product.id}`}
              className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
            >
              New Price Per Litre (₹)
            </label>
            <input
              id={`price-${product.id}`}
              ref={priceInputRef}
              type="number"
              step="1"
              min="10"
              max="500"
              defaultValue={product.pricePerLitre}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-mono focus:border-green-mid focus:ring-green-mid"
              required
            />
          </div>

          <div>
            <label
              htmlFor={`note-${product.id}`}
              className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
            >
              Revision Reason / Note
            </label>
            <input
              id={`note-${product.id}`}
              ref={noteInputRef}
              type="text"
              placeholder="e.g. Fodder cost revision"
              defaultValue="Standard dairy seasonal rate"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-mid focus:ring-green-mid"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isPending}
          >
            {isPending ? 'Updating Rate...' : 'Save New Price via Ref'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
