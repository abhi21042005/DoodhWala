'use client';

// planner form: manages lifted state, live useMemo monthly calculation, and server action submission
import { useState, useMemo, useTransition } from 'react';
import WeeklyGrid from './WeeklyGrid';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatRupees, calcDayAmount, calcMonthlyEstimate } from '@/lib/money';
import { savePlanAction } from './actions';
import { useUiStore } from '@/stores/uiStore';

export default function PlannerForm({ initialData, onSaved }) {
  const { products, subscription } = initialData;
  const addToast = useUiStore((s) => s.addToast);

  // local state
  const [selectedProductId, setSelectedProductId] = useState(
    subscription?.productId || products[0]?.id || ''
  );

  // default 7 days state if not existing
  const [days, setDays] = useState(
    subscription?.days ||
      [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, litres: 1.0 }))
  );

  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState('');

  // active product object
  const activeProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || products[0],
    [products, selectedProductId]
  );

  // INT252 Requirement: useMemo for pure calculation of live estimate
  const monthlyCostEstimate = useMemo(() => {
    if (!activeProduct) return 0;
    return calcMonthlyEstimate(days, activeProduct.pricePerLitre);
  }, [days, activeProduct]);

  // weekly total litres
  const weeklyTotalLitres = useMemo(() => {
    return Math.round(days.reduce((acc, d) => acc + d.litres, 0) * 10) / 10;
  }, [days]);

  // lifted state handler: immutable state update (INT252 requirement: never mutate state)
  const handleDayChange = (weekday, newLitres) => {
    setDays((prevDays) =>
      prevDays.map((day) =>
        day.weekday === weekday ? { ...day, litres: newLitres } : day
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (weeklyTotalLitres === 0) {
      setFormError('Please select at least 0.5 L on at least one day.');
      return;
    }

    startTransition(async () => {
      const res = await savePlanAction({
        productId: selectedProductId,
        days,
      });

      if (res.success) {
        addToast('Subscription plan saved successfully!', 'success');
        if (onSaved) onSaved();
      } else {
        setFormError(res.error || 'Failed to save subscription.');
        addToast(res.error || 'Failed to save', 'error');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-red-light border border-red-soft text-sm text-red-soft"
        >
          {formError}
        </div>
      )}

      {/* Product Selector */}
      <Card className="p-5">
        <label className="block text-sm font-semibold font-serif text-gray-800 mb-3">
          1. Select Your Milk Variety
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {products.map((prod) => {
            const isSelected = prod.id === selectedProductId;
            return (
              <div
                key={prod.id}
                onClick={() => setSelectedProductId(prod.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-green-deep bg-green-light/40 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div>
                  <p className="font-serif font-bold text-gray-900">{prod.name}</p>
                  <p className="text-xs text-gray-500">Pure unboiled cow milk</p>
                </div>
                <div className="text-right">
                  <p className="font-bold font-serif text-green-deep text-lg">
                    {formatRupees(prod.pricePerLitre)}
                  </p>
                  <span className="text-[10px] text-gray-400">per litre</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Weekly Grid (Lifting state up) */}
      <Card className="p-5">
        <WeeklyGrid days={days} onChangeDay={handleDayChange} />
      </Card>

      {/* Live Cost Summary Banner */}
      <div className="bg-cream-dark border border-gray-300 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase font-mono tracking-wider text-gray-500">
            Live Cost Estimate
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-green-deep">
              {formatRupees(monthlyCostEstimate)}
            </span>
            <span className="text-xs text-gray-600">/ estimated 30-day month</span>
          </div>
          <p className="text-xs text-gray-500">
            {weeklyTotalLitres} L per week × {formatRupees(activeProduct?.pricePerLitre || 0)} / L
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          variant="primary"
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? 'Saving Plan...' : 'Save Subscription Plan'}
        </Button>
      </div>
    </form>
  );
}
