// apps/platform/src/components/layout/index.tsx
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './header';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}