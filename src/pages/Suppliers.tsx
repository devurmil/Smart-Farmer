import React, { useEffect, useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { getBackendUrl } from '@/lib/utils';

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : '?';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await fetch(`${getBackendUrl()}/api/supplies/suppliers`);
        const data = await res.json();
        if (data.success) {
          setSuppliers(data.data);
        } else {
          setError('Failed to fetch suppliers');
        }
      } catch (err) {
        setError('Error fetching suppliers');
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64">Loading suppliers...</div>;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Suppliers</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {suppliers.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">No suppliers found.</div>
        ) : (
          suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center border border-gray-100 hover:shadow-2xl transition-all duration-200 group"
            >
              <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="text-4xl font-bold text-white select-none">
                  {getInitial(supplier.name)}
                </span>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center">{supplier.name}</h2>
              <div className="flex flex-col gap-1 items-center w-full">
                <a
                  href={`mailto:${supplier.email}`}
                  className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                >
                  <Mail className="w-4 h-4" />
                  {supplier.email}
                </a>
                {supplier.phone && (
                  <a
                    href={`tel:${supplier.phone}`}
                    className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    {supplier.phone}
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Suppliers; 