// apps/platform/src/pages/tenants/index.tsx
export function TenantsPage() {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tenants</h1>
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
            Add Tenant
          </button>
        </div>
  
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <p className="text-gray-500">No tenants found</p>
          </div>
        </div>
      </div>
    );
  }