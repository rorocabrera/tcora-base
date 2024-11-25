// apps/platform/src/components/layout/header.jsx
import { Bell, User } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center">
          <span className="text-lg font-semibold">Platform Admin</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{user?.email}</span>
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}