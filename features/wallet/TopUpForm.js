'use client';

// controlled form for wallet recharge with preset amounts and zod validation
import { useState, useTransition } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { topupSchema } from '@/lib/schemas';
import { topupAction } from './actions';
import { useUiStore } from '@/stores/uiStore';
import { useAuth } from '@/features/auth/AuthContext';

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

export default function TopUpForm({ onSuccess }) {
  const [amount, setAmount] = useState('1000');
  const [method, setMethod] = useState('UPI');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const addToast = useUiStore((s) => s.addToast);
  const { refreshUser } = useAuth();

  const handleSelectPreset = (val) => {
    setAmount(String(val));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(amount);
    const parsed = topupSchema.safeParse({ amount: numAmount });

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || 'Invalid amount');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('amount', String(numAmount));

      const res = await topupAction(null, formData);
      if (res.success) {
        addToast(`₹${numAmount} added to your wallet successfully!`, 'success');
        refreshUser();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Payment simulation failed');
        addToast(res.error || 'Failed to top up', 'error');
      }
    });
  };

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-lg font-bold font-serif text-gray-900 mb-1">
        Add Money to Wallet
      </h2>
      <p className="text-xs text-gray-600 mb-4">
        Simulated instant payment. Minimum ₹100, maximum ₹10,000.
      </p>

      {error && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg bg-red-light border border-red-soft text-sm text-red-soft"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Presets */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Quick Select Amount
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`py-2 px-1 rounded-lg text-xs font-bold font-mono transition-colors border ${
                  amount === String(preset)
                    ? 'bg-green-deep text-white border-green-deep'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-cream-dark'
                }`}
              >
                ₹{preset}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <Input
          label="Custom Amount (₹)"
          id="amount"
          type="number"
          min="100"
          max="10000"
          step="50"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError('');
          }}
          placeholder="Enter amount between 100 and 10,000"
          error={error}
          required
        />

        {/* Simulated Payment Modes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Simulated Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['UPI (GPay, PhonePe, Paytm)', 'Net Banking (SBI, HDFC, PNB)'].map((m) => (
              <label
                key={m}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center gap-2 ${
                  method === m
                    ? 'border-green-deep bg-green-light/40 text-green-deep font-semibold'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={method === m}
                  onChange={() => setMethod(m)}
                  className="accent-green-deep"
                />
                <span>{m}</span>
              </label>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          variant="primary"
          disabled={isPending}
          className="w-full mt-2"
        >
          {isPending ? 'Processing Simulation...' : `Pay ₹${amount || 0}`}
        </Button>
      </form>
    </Card>
  );
}
