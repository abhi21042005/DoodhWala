// Rendering Strategy: SSG (Static Site Generation)
// Fully static documentation page for subscriber policies, schedules, and billing rules.

import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export const metadata = {
  title: 'How It Works - Daily Delivery & Billing Guide',
  description:
    'Complete guide to subscribing, setting daily milk quantities, pausing deliveries, and managing your DoodhWala prepaid wallet.',
};

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      <div className="border-b border-gray-200 pb-6">
        <span className="text-xs font-mono uppercase tracking-wider text-green-deep font-semibold">
          Customer Handbook
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 mt-1">
          How DoodhWala Works
        </h1>
        <p className="mt-2 text-base text-gray-600">
          Everything you need to know about our daily milk rounds, 10 PM order cutoff, and wallet deductions.
        </p>
      </div>

      {/* 4 Steps */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold font-serif text-gray-900">
          Four Simple Steps to Fresh Milk
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5">
            <span className="text-xs font-mono font-bold text-terracotta">STEP 1</span>
            <h3 className="font-serif font-bold text-gray-900 text-lg mt-1">
              Choose Milk & Plan
            </h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Select Desi Cow (₹62/L) or A2 Gir Cow (₹85/L). Choose how many litres you need for Monday through Sunday in 0.5 L steps.
            </p>
          </Card>

          <Card className="p-5">
            <span className="text-xs font-mono font-bold text-terracotta">STEP 2</span>
            <h3 className="font-serif font-bold text-gray-900 text-lg mt-1">
              Top Up Your Wallet
            </h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Add prepaid credits (from ₹100 to ₹10,000) using UPI or Netbanking simulation. Your balance stays safe and never expires.
            </p>
          </Card>

          <Card className="p-5">
            <span className="text-xs font-mono font-bold text-terracotta">STEP 3</span>
            <h3 className="font-serif font-bold text-gray-900 text-lg mt-1">
              Morning Doorstep Delivery
            </h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Our delivery partner drops your fresh milk bottle into your bag between 5:30 AM and 7:00 AM before your day begins.
            </p>
          </Card>

          <Card className="p-5">
            <span className="text-xs font-mono font-bold text-terracotta">STEP 4</span>
            <h3 className="font-serif font-bold text-gray-900 text-lg mt-1">
              Daily Auto-Deduction
            </h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              When the dairy owner confirms today’s delivery, the exact cost (litres × price) is deducted from your wallet ledger.
            </p>
          </Card>
        </div>
      </div>

      {/* Business rules & Cutoff policy */}
      <div className="bg-cream-dark border border-gray-300 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold font-serif text-gray-900">
          The 10:00 PM Nightly Cutoff Rule
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          Because our cows are milked at 4:30 AM every morning and delivery routes are mapped overnight, all modifications for tomorrow morning must be made before <strong>10:00 PM IST tonight</strong>:
        </p>
        <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
          <li><strong>Skipping tomorrow:</strong> You can skip delivery for tomorrow until 10:00 PM without any charge.</li>
          <li><strong>Changing quantity:</strong> Need an extra litre tomorrow for visiting guests? Update your tomorrow date in the Calendar before 10:00 PM.</li>
          <li><strong>Pausing for vacation:</strong> Pauses starting tomorrow must be created before 10:00 PM. Any paused day is never billed.</li>
        </ul>
      </div>

      {/* Wallet policy */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-gray-900">
          Wallet & Balance Guidelines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <strong className="block text-gray-900 mb-1">Low Balance Protection</strong>
            If your wallet balance is lower than tomorrow morning’s milk cost, delivery is marked <em>MISSED</em> and no negative balance is ever created. You can top up anytime to resume delivery.
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <strong className="block text-gray-900 mb-1">Pause & Resume Freedom</strong>
            Going on vacation? Enter your departure and return dates in the Pause tab. If you return early, click &ldquo;Resume Early&rdquo; with one tap.
          </div>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between border-t border-gray-200">
        <div>
          <p className="font-serif font-bold text-gray-900">Ready to taste farm-fresh milk?</p>
          <p className="text-xs text-gray-600">Register in under two minutes with no setup fee.</p>
        </div>
        <Link href="/register">
          <Button variant="primary">Register Now</Button>
        </Link>
      </div>
    </div>
  );
}
