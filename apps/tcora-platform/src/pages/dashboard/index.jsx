// apps/platform/src/pages/dashboard/index.jsx
export function DashboardPage() {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Tenants</h3>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Active Tenants</h3>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">System Health</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">Good</p>
          </div>
        </div>
      </div>
    );
  }