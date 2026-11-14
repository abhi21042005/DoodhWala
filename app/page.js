// Rendering Strategy: SSG (Static Site Generation)
// This page is statically generated at build time with zero server latency.

import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export const metadata = {
  title: 'DoodhWala - Fresh Cow Milk Delivery in Punjab',
  description:
    'Pure Desi and A2 Gir cow milk delivered raw and chilled to your door every morning in Fatehgarh Sahib, Mandi Gobindgarh and Amloh.',
};

export default function HomePage() {
  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-light border border-green-mid/30 text-xs font-medium text-green-deep">
              <span className="w-2 h-2 rounded-full bg-green-mid" />
              Morning delivery by 7:00 AM across Fatehgarh Sahib district
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold font-serif text-gray-900 tracking-tight leading-[1.15]">
              Pure, unpasteurised cow milk at your doorstep every morning.
            </h1>

            <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-xl">
              Freshly milked at 4:30 AM from pasture-fed Desi and A2 Gir cows. Chilled immediately and delivered in glass bottles to homes in Fatehgarh Sahib, Mandi Gobindgarh, and Amloh.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/register">
                <Button size="lg" variant="primary">
                  Start Your Subscription
                </Button>
              </Link>
              <Link href="/plans">
                <Button size="lg" variant="secondary">
                  View Milk Rates
                </Button>
              </Link>
            </div>

            {/* Quick trust marks */}
            <div className="pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-left">
              <div>
                <p className="text-xl sm:text-2xl font-serif font-bold text-green-deep">0%</p>
                <p className="text-xs text-gray-600">Preservatives or chemicals</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-serif font-bold text-green-deep">10:00 PM</p>
                <p className="text-xs text-gray-600">Nightly cutoff to pause/edit</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-serif font-bold text-green-deep">₹100</p>
                <p className="text-xs text-gray-600">Minimum wallet top-up</p>
              </div>
            </div>
          </div>

          {/* Side card - Daily schedule note */}
          <div className="lg:col-span-5">
            <div className="bg-cream-dark border-2 border-gray-300 rounded-2xl p-6 sm:p-7 space-y-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-300">
                <span className="font-serif font-bold text-gray-800 text-lg">
                  Morning Milk Routine
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-terracotta-light text-terracotta font-medium">
                  Direct Farm
                </span>
              </div>

              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs font-semibold text-green-deep bg-green-light px-2 py-1 rounded">
                    04:30 AM
                  </span>
                  <div>
                    <strong className="block text-gray-900">Milking at Farm</strong>
                    <span className="text-xs text-gray-600">Hygienic machine milking at our dairy farm near Mandi Gobindgarh.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs font-semibold text-green-deep bg-green-light px-2 py-1 rounded">
                    05:15 AM
                  </span>
                  <div>
                    <strong className="block text-gray-900">Chilling & Dispatch</strong>
                    <span className="text-xs text-gray-600">Chilled to 4°C instantly to preserve nutritional density and taste.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs font-semibold text-green-deep bg-green-light px-2 py-1 rounded">
                    06:45 AM
                  </span>
                  <div>
                    <strong className="block text-gray-900">Doorstep Delivery</strong>
                    <span className="text-xs text-gray-600">Placed in your milk bag outside your door before breakfast tea.</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs text-gray-600">
                <strong className="text-gray-900 block mb-0.5">Need to pause for holidays?</strong>
                Going out of station? Pause any date range right from your phone before 10:00 PM the night before.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="bg-white border-y border-gray-200 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900">
              How DoodhWala works differently
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              No locked contracts. Complete flexibility over your daily milk volume.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3">
              <span className="text-xs font-mono font-bold text-terracotta tracking-wider uppercase">
                01. Quantity Planner
              </span>
              <h3 className="text-lg font-bold font-serif text-gray-900">
                Set litres day-by-day
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Need 1.0 L on weekdays for tea and cereal, but 2.5 L on Saturday and Sunday for kheer or paneer? Tune every single day in 0.5 L steps.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <span className="text-xs font-mono font-bold text-terracotta tracking-wider uppercase">
                02. Pause Anytime
              </span>
              <h3 className="text-lg font-bold font-serif text-gray-900">
                Going out of town?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Pause subscription for any date range with one tap. Resume early whenever your plans change. You are never billed for paused days.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <span className="text-xs font-mono font-bold text-terracotta tracking-wider uppercase">
                03. Prepaid Wallet
              </span>
              <h3 className="text-lg font-bold font-serif text-gray-900">
                Transparent daily deductions
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Add money when convenient. Each morning’s delivery deducts only what you received. Check your real-time balance and days of milk left anytime.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Local Customer Testimonials */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold font-serif text-gray-900 mb-6">
          Trusted by families in our neighbourhood
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-gray-200 bg-cream-dark">
            <p className="text-sm text-gray-700 italic mb-4 leading-relaxed">
              &ldquo;The milk has thick malai just like we used to get in the village years ago. Being able to pause delivery directly on my mobile when we visit our relatives in Ludhiana is so convenient.&rdquo;
            </p>
            <div className="text-xs">
              <strong className="block text-gray-900">Gurpreet Singh</strong>
              <span className="text-gray-600">Mohalla Guru Nanak, Mandi Gobindgarh (1.5 L Desi Cow)</span>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-cream-dark">
            <p className="text-sm text-gray-700 italic mb-4 leading-relaxed">
              &ldquo;We shifted to A2 Gir cow milk for our toddler. The quality is consistent, delivery is always on time before 7 AM, and the wallet deduction ledger is 100% clear with zero hidden costs.&rdquo;
            </p>
            <div className="text-xs">
              <strong className="block text-gray-900">Simran Kaur</strong>
              <span className="text-gray-600">Prem Nagar, Amloh (1.0 L A2 Gir)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
