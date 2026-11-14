'use client';

// profile page - allows customer to view details and upload/update profile info
import { useAuth } from '@/features/auth/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold font-serif text-gray-900">
          Subscriber Profile
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Your delivery address, contact details, and account settings.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase">Name</span>
            <p className="text-sm font-medium text-gray-800">{user?.name || '—'}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase">Role</span>
            <p className="text-sm font-medium text-gray-800">{user?.role || 'CUSTOMER'}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase">Phone</span>
            <p className="text-sm font-mono text-gray-800">{user?.phone || '—'}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase">Email</span>
            <p className="text-sm text-gray-800">{user?.email || '—'}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase">Delivery Area</span>
            <p className="text-sm text-gray-800">{user?.area || '—'}</p>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase">Delivery Address</span>
          <p className="text-sm text-gray-800 mt-1">{user?.address || '—'}</p>
        </div>
      </Card>
    </div>
  );
}
