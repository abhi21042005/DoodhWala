'use client';

// Rendering Strategy: SSR / Client interactive hybrid for live dispatch actions
import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatRupees } from '@/lib/money';
import { useUiStore } from '@/stores/uiStore';

export default function AdminTodayDeliveriesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const addToast = useUiStore((s) => s.addToast);

  const fetchTodayList = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/today-list');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayList();
  }, []);

  const handleProcessToday = async () => {
    if (!confirm("Run batch processing for today? This will verify balances and debit customer wallets.")) {
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/process-today', { method: 'POST' });
      const json = await res.json();
      if (res.ok) {
        addToast(json.message || 'Deliveries processed successfully!', 'success');
        fetchTodayList();
      } else {
        addToast(json.error || 'Failed to process', 'error');
      }
    } catch {
      addToast('Network error while processing deliveries', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkStatus = async (deliveryId, status, proofFile) => {
    setUploadingId(deliveryId);
    try {
      const formData = new FormData();
      formData.append('deliveryId', deliveryId);
      formData.append('status', status);
      if (proofFile) {
        formData.append('proof', proofFile);
      }

      const res = await fetch('/api/admin/delivery-status', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        addToast(`Delivery marked as ${status}!`, 'success');
        fetchTodayList();
      } else {
        const json = await res.json();
        addToast(json.error || 'Failed to update', 'error');
      }
    } catch {
      addToast('Error updating delivery', 'error');
    } finally {
      setUploadingId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-green-deep animate-spin mx-auto mb-2" />
        <p className="text-xs text-gray-500">Loading today's delivery lists...</p>
      </div>
    );
  }

  const { areas = {}, totals = {} } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Banner & Batch Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200">
        <div>
          <h2 className="text-xl font-bold font-serif text-gray-900">
            Today's Dispatch Rounds ({totals.formattedDate || 'Today'})
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Grouped by Punjab delivery areas. Review drops and run daily wallet deductions.
          </p>
        </div>

        <Button
          size="lg"
          variant="primary"
          disabled={processing}
          onClick={handleProcessToday}
        >
          {processing ? 'Processing Batch...' : "⚡ Process Today's Deliveries"}
        </Button>
      </div>

      {/* Summary KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 text-center">
          <span className="text-[10px] font-mono uppercase text-gray-400 block">Total Litres</span>
          <span className="text-2xl font-bold font-mono text-gray-900">{totals.totalLitres ?? 0} L</span>
        </Card>
        <Card className="p-4 text-center border-l-4 border-l-green-deep">
          <span className="text-[10px] font-mono uppercase text-gray-400 block">Delivered</span>
          <span className="text-2xl font-bold font-mono text-green-deep">{totals.deliveredCount ?? 0}</span>
        </Card>
        <Card className="p-4 text-center border-l-4 border-l-red-soft">
          <span className="text-[10px] font-mono uppercase text-gray-400 block">Missed / Failed</span>
          <span className="text-2xl font-bold font-mono text-red-soft">{totals.missedCount ?? 0}</span>
        </Card>
        <Card className="p-4 text-center border-l-4 border-l-terracotta">
          <span className="text-[10px] font-mono uppercase text-gray-400 block">Paused</span>
          <span className="text-2xl font-bold font-mono text-terracotta">{totals.pausedCount ?? 0}</span>
        </Card>
      </div>

      {/* Deliveries Grouped by Area */}
      {Object.keys(areas).length === 0 ? (
        <Card className="p-8 text-center text-sm text-gray-500">
          No scheduled deliveries found for today.
        </Card>
      ) : (
        Object.entries(areas).map(([areaName, deliveries]) => (
          <div key={areaName} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-deep" />
              <h3 className="font-serif font-bold text-lg text-gray-900">
                {areaName} ({deliveries.length} customers)
              </h3>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Address</th>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Quantity</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Proof / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {deliveries.map((item) => (
                      <tr key={item.subscriptionId} className="hover:bg-cream-dark/30">
                        <td className="py-3 px-4">
                          <strong className="block text-gray-900">{item.userName}</strong>
                          <span className="text-xs font-mono text-gray-500">{item.userPhone}</span>
                        </td>
                        <td className="py-3 px-4 text-xs max-w-xs text-gray-600">
                          {item.userAddress}
                        </td>
                        <td className="py-3 px-4 text-xs font-medium">
                          {item.productName}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-sm">
                          {item.litres} L
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                              item.status === 'DELIVERED'
                                ? 'bg-green-light text-green-deep'
                                : item.status === 'MISSED'
                                ? 'bg-red-light text-red-soft'
                                : item.status === 'PAUSED'
                                ? 'bg-terracotta-light text-terracotta'
                                : 'bg-blue-milk-light text-gray-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {item.deliveryId ? (
                            <div className="flex items-center justify-end gap-2">
                              {/* File Upload for proof */}
                              <label
                                className={`text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-cream-dark cursor-pointer ${
                                  uploadingId === item.deliveryId ? 'opacity-50 pointer-events-none' : ''
                                }`}
                                title="Upload delivery proof photo"
                              >
                                📷 Photo
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleMarkStatus(item.deliveryId, 'DELIVERED', e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>

                              {item.status !== 'DELIVERED' && (
                                <button
                                  type="button"
                                  disabled={uploadingId === item.deliveryId}
                                  onClick={() => handleMarkStatus(item.deliveryId, 'DELIVERED', null)}
                                  className="text-xs px-2.5 py-1 rounded bg-green-deep text-white hover:bg-green-mid"
                                >
                                  ✓ Mark Done
                                </button>
                              )}

                              {item.status !== 'FAILED' && (
                                <button
                                  type="button"
                                  disabled={uploadingId === item.deliveryId}
                                  onClick={() => handleMarkStatus(item.deliveryId, 'FAILED', null)}
                                  className="text-xs px-2 py-1 rounded border border-red-soft text-red-soft hover:bg-red-light"
                                >
                                  ✕ Fail
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Process batch first</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}
