import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { getBackendUrl } from '@/lib/utils';
import AddEquipmentForm from '../components/AddEquipmentForm';
import AddSupplyForm from '../components/AddSupplyForm';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  created_at?: string;
}
// Add password to Partial<User> for form state
interface UserForm extends Partial<User> {
  password?: string;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  price: number;
  description?: string;
  imageUrl?: string;
  ownerId: string;
  available: boolean;
  createdAt?: string;
  owner?: User;
}

interface Supply {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  description?: string;
  brand?: string;
  imageUrl?: string;
  supplierId: string;
  available: boolean;
  expiryDate?: string;
  createdAt?: string;
  supplier?: User;
}

const emptyUser: UserForm = { name: '', email: '', phone: '', role: 'farmer', password: '' };

const AdminPage: React.FC = () => {
  const { token } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editUser, setEditUser] = useState<UserForm | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addUser, setAddUser] = useState<UserForm>({ ...emptyUser });
  const [showDelete, setShowDelete] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  // Content management state
  const [showContent, setShowContent] = useState(false);
  const [contentUser, setContentUser] = useState<User | null>(null);
  const [farms, setFarms] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [supplies, setSupplies] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  // Admin sections state
  const [activeSection, setActiveSection] = useState<'users' | 'equipment' | 'supplies'>('users');
  
  // Equipment management state
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [equipmentError, setEquipmentError] = useState<string | null>(null);
  const [showDeleteEquipment, setShowDeleteEquipment] = useState(false);
  const [deleteEquipmentId, setDeleteEquipmentId] = useState<string | null>(null);
  const [showEditEquipment, setShowEditEquipment] = useState(false);
  const [editEquipment, setEditEquipment] = useState<Equipment | null>(null);

  // Supply management state
  const [allSupplies, setAllSupplies] = useState<Supply[]>([]);
  const [suppliesLoading, setSuppliesLoading] = useState(false);
  const [suppliesError, setSuppliesError] = useState<string | null>(null);
  const [showDeleteSupply, setShowDeleteSupply] = useState(false);
  const [deleteSupplyId, setDeleteSupplyId] = useState<string | null>(null);
  const [showEditSupply, setShowEditSupply] = useState(false);
  const [editSupply, setEditSupply] = useState<Supply | null>(null);
  const [showAddSupply, setShowAddSupply] = useState(false);

  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [owners, setOwners] = useState<User[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    console.log('JWT token:', token); // Debug log
    try {
      const res = await fetch(`${getBackendUrl()}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch users');
      setUsers(data.data.users);
    } catch (err: any) {
      setError(err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [token]);

  // Delete user
  const handleDelete = async (id: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`${getBackendUrl()}/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to delete user');
      setShowDelete(false);
      setDeleteUserId(null);
      fetchUsers();
    } catch (err: any) {
      setActionError(err.message || 'Error deleting user');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit user
  const handleEdit = (user: User) => {
    setEditUser(user);
    setShowEdit(true);
  };
  const submitEdit = async () => {
    if (!editUser || !editUser.id) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`${getBackendUrl()}/api/users/${editUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editUser),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to update user');
      setShowEdit(false);
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      setActionError(err.message || 'Error updating user');
    } finally {
      setActionLoading(false);
    }
  };

  // Add user
  const submitAdd = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`${getBackendUrl()}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addUser),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to add user');
      setShowAdd(false);
      setAddUser({ ...emptyUser });
      fetchUsers();
    } catch (err: any) {
      setActionError(err.message || 'Error adding user');
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch all equipment for admin
  const fetchAllEquipment = async () => {
    setEquipmentLoading(true);
    setEquipmentError(null);
    try {
      const res = await fetch(`${getBackendUrl()}/api/equipment?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch equipment');
      }
      
      // The equipment data already includes owner information from the backend
      setAllEquipment(data.data || []);
    } catch (err: any) {
      setEquipmentError(err.message || 'Error fetching equipment');
    } finally {
      setEquipmentLoading(false);
    }
  };

  // Fetch all supplies for admin
  const fetchAllSupplies = async () => {
    setSuppliesLoading(true);
    setSuppliesError(null);
    try {
      const res = await fetch(`${getBackendUrl()}/api/supplies?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      // Handle the new structured response
      if (data.success) {
        // Fetch supplier details for each supply
        const suppliesWithSuppliers = await Promise.all(
          (data.data || []).map(async (supply: Supply) => {
            try {
              const supplierRes = await fetch(`${getBackendUrl()}/api/users/${supply.supplierId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const supplierData = await supplierRes.json();
              return { ...supply, supplier: supplierData.success ? supplierData.data : null };
            } catch {
              return { ...supply, supplier: null };
            }
          })
        );
        setAllSupplies(suppliesWithSuppliers);
      } else {
        throw new Error(data.message || 'Failed to fetch supplies');
      }
    } catch (err: any) {
      setSuppliesError(err.message || 'Error fetching supplies');
    } finally {
      setSuppliesLoading(false);
    }
  };

  // Edit equipment
  const handleEditEquipment = (equipment: Equipment) => {
    setEditEquipment(equipment);
    setShowEditEquipment(true);
  };

  const submitEditEquipment = async () => {
    if (!editEquipment || !editEquipment.id) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`${getBackendUrl()}/api/equipment/${editEquipment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editEquipment.name,
          type: editEquipment.type,
          price: editEquipment.price,
          description: editEquipment.description,
          available: editEquipment.available,
          ownerId: editEquipment.ownerId
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update equipment');
      setShowEditEquipment(false);
      setEditEquipment(null);
      fetchAllEquipment();
    } catch (err: any) {
      setActionError(err.message || 'Error updating equipment');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete equipment
  const handleDeleteEquipment = async (id: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`${getBackendUrl()}/api/equipment/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete equipment');
      setShowDeleteEquipment(false);
      setDeleteEquipmentId(null);
      fetchAllEquipment();
    } catch (err: any) {
      setActionError(err.message || 'Error deleting equipment');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete supply
  const handleDeleteSupply = async (id: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`${getBackendUrl()}/api/supplies/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to delete supply');
      setShowDeleteSupply(false);
      setDeleteSupplyId(null);
      fetchAllSupplies();
    } catch (err: any) {
      setActionError(err.message || 'Error deleting supply');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit supply
  const handleEditSupply = (supply: Supply) => {
    setEditSupply(supply);
    setShowEditSupply(true);
  };

  const submitEditSupply = async () => {
    if (!editSupply || !editSupply.id) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`${getBackendUrl()}/api/supplies/${editSupply.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editSupply.name,
          category: editSupply.category,
          price: editSupply.price,
          unit: editSupply.unit,
          quantity: editSupply.quantity,
          description: editSupply.description,
          brand: editSupply.brand,
          available: editSupply.available,
          expiryDate: editSupply.expiryDate,
          supplierId: editSupply.supplierId
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update supply');
      setShowEditSupply(false);
      setEditSupply(null);
      fetchAllSupplies();
    } catch (err: any) {
      setActionError(err.message || 'Error updating supply');
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch data based on active section
  useEffect(() => {
    if (activeSection === 'equipment') {
      fetchAllEquipment();
    } else if (activeSection === 'supplies') {
      fetchAllSupplies();
    }
  }, [activeSection, token]);

  // Fetch user content when modal opens
  useEffect(() => {
    const fetchContent = async () => {
      if (!showContent || !contentUser) return;
      setContentLoading(true);
      setContentError(null);
      try {
        // Fetch farms
        const farmsRes = await fetch(`${getBackendUrl()}/api/farms?user_id=${contentUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const farmsData = await farmsRes.json();
        setFarms(farmsData.data?.farms || []);
        // Fetch equipment
        const equipRes = await fetch(`${getBackendUrl()}/api/equipment?user_id=${contentUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const equipData = await equipRes.json();
        setEquipment(equipData.data?.equipment || []);
        // Fetch supplies
        const supplyRes = await fetch(`${getBackendUrl()}/api/supplies?user_id=${contentUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const supplyData = await supplyRes.json();
        setSupplies(supplyData.data?.supplies || []);
      } catch (err: any) {
        setContentError(err.message || 'Error fetching user content');
      } finally {
        setContentLoading(false);
      }
    };
    fetchContent();
  }, [showContent, contentUser, token]);

  // Fetch users for equipment owners and supply suppliers
  useEffect(() => {
    if (activeSection === 'equipment' || activeSection === 'supplies') {
      fetchUsers();
    }
  }, [activeSection]);

  return (
    <div className="main-bg min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${activeSection === 'users' ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => setActiveSection('users')}
        >
          User Management
        </button>
        <button
          className={`px-4 py-2 rounded ${activeSection === 'equipment' ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => setActiveSection('equipment')}
        >
          Equipment Management
        </button>
        <button
          className={`px-4 py-2 rounded ${activeSection === 'supplies' ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => setActiveSection('supplies')}
        >
          Supply Management
        </button>
      </div>

      {/* User Management Section */}
      {activeSection === 'users' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">User List</h2>
            <button className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800" onClick={() => setShowAdd(true)}>
              Add User
            </button>
          </div>
          {loading && <div>Loading users...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-900 rounded shadow">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b">Name</th>
                    <th className="px-4 py-2 border-b">Email</th>
                    <th className="px-4 py-2 border-b">Phone</th>
                    <th className="px-4 py-2 border-b">Role</th>
                    <th className="px-4 py-2 border-b">Created</th>
                    <th className="px-4 py-2 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-800">
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">{user.phone || '-'}</td>
                      <td className="px-4 py-2">{user.role || '-'}</td>
                      <td className="px-4 py-2">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2 flex flex-wrap gap-2">
                        <button className="text-blue-600 hover:underline mr-2" onClick={() => handleEdit(user)}>Edit</button>
                        <button className="text-red-600 hover:underline mr-2" onClick={() => { setShowDelete(true); setDeleteUserId(user.id); }}>Delete</button>
                        <button className="text-green-700 hover:underline" onClick={() => { setShowContent(true); setContentUser(user); }}>View Content</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Equipment Management Section */}
      {activeSection === 'equipment' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Equipment Management</h2>
            <button className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800" onClick={() => setShowAddEquipment(true)}>
              Add Equipment
            </button>
          </div>
          {showAddEquipment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
                <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={() => setShowAddEquipment(false)}>&times;</button>
                <AddEquipmentForm
                  isAdmin={true}
                  owners={users}
                  onClose={() => setShowAddEquipment(false)}
                  onEquipmentAdded={fetchAllEquipment}
                />
              </div>
            </div>
          )}
          {equipmentLoading && <div>Loading equipment...</div>}
          {equipmentError && <div className="text-red-600">{equipmentError}</div>}
          {!equipmentLoading && !equipmentError && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-900 rounded shadow">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b">Image</th>
                    <th className="px-4 py-2 border-b">Name</th>
                    <th className="px-4 py-2 border-b">Type</th>
                    <th className="px-4 py-2 border-b">Price</th>
                    <th className="px-4 py-2 border-b">Owner</th>
                    <th className="px-4 py-2 border-b">Available</th>
                    <th className="px-4 py-2 border-b">Created</th>
                    <th className="px-4 py-2 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allEquipment.map((equipment) => (
                    <tr key={equipment.id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-800">
                      <td className="px-4 py-2">
                        {equipment.imageUrl ? (
                          <img src={equipment.imageUrl} alt={equipment.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">No Image</div>
                        )}
                      </td>
                      <td className="px-4 py-2">{equipment.name}</td>
                      <td className="px-4 py-2">{equipment.type}</td>
                      <td className="px-4 py-2">₹{equipment.price}</td>
                      <td className="px-4 py-2">{equipment.owner?.name || 'Unknown'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${equipment.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {equipment.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-4 py-2">{equipment.createdAt ? new Date(equipment.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2 flex flex-wrap gap-2">
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => handleEditEquipment(equipment)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => { setShowDeleteEquipment(true); setDeleteEquipmentId(equipment.id); }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Supply Management Section */}
      {activeSection === 'supplies' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Supply Management</h2>
            <button className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800" onClick={() => setShowAddSupply(true)}>
              Add Supply
            </button>
          </div>
          {showAddSupply && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
                <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={() => setShowAddSupply(false)}>&times;</button>
                <AddSupplyForm
                  isAdmin={true}
                  suppliers={users}
                  onClose={() => setShowAddSupply(false)}
                  onSupplyAdded={() => {
                    setShowAddSupply(false);
                    fetchAllSupplies();
                  }}
                />
              </div>
            </div>
          )}
          {suppliesLoading && <div>Loading supplies...</div>}
          {suppliesError && <div className="text-red-600">{suppliesError}</div>}
          {!suppliesLoading && !suppliesError && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-900 rounded shadow">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b">Image</th>
                    <th className="px-4 py-2 border-b">Name</th>
                    <th className="px-4 py-2 border-b">Category</th>
                    <th className="px-4 py-2 border-b">Price</th>
                    <th className="px-4 py-2 border-b">Quantity</th>
                    <th className="px-4 py-2 border-b">Supplier</th>
                    <th className="px-4 py-2 border-b">Available</th>
                    <th className="px-4 py-2 border-b">Expiry</th>
                    <th className="px-4 py-2 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allSupplies.map((supply) => (
                    <tr key={supply.id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-800">
                      <td className="px-4 py-2">
                        {supply.imageUrl ? (
                          <img src={supply.imageUrl} alt={supply.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">No Image</div>
                        )}
                      </td>
                      <td className="px-4 py-2">{supply.name}</td>
                      <td className="px-4 py-2">{supply.category}</td>
                      <td className="px-4 py-2">₹{supply.price}/{supply.unit}</td>
                      <td className="px-4 py-2">{supply.quantity} {supply.unit}</td>
                      <td className="px-4 py-2">{supply.supplier?.name || 'Unknown'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${supply.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {supply.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-4 py-2">{supply.expiryDate ? new Date(supply.expiryDate).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2 flex flex-wrap gap-2">
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => handleEditSupply(supply)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => { setShowDeleteSupply(true); setDeleteSupplyId(supply.id); }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* User Content Modal */}
      {showContent && contentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-semibold mb-4">User Content: {contentUser.name}</h3>
            {contentLoading && <div>Loading content...</div>}
            {contentError && <div className="text-red-600 mb-2">{contentError}</div>}
            {!contentLoading && !contentError && (
              <>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Farms</h4>
                  {farms.length === 0 ? (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 mb-2">No farms found.</div>
                  ) : (
                    <ul className="bg-gray-100 dark:bg-gray-800 rounded p-2 mb-2">
                      {farms.map((farm: any) => (
                        <li key={farm.id} className="mb-1">
                          <span className="font-medium">{farm.name}</span> - {farm.location?.address || 'No address'}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Equipment</h4>
                  {equipment.length === 0 ? (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 mb-2">No equipment found.</div>
                  ) : (
                    <ul className="bg-gray-100 dark:bg-gray-800 rounded p-2 mb-2">
                      {equipment.map((eq: any) => (
                        <li key={eq.id} className="mb-1">
                          <span className="font-medium">{eq.name || eq.type || 'Equipment'}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Supply List</h4>
                  {supplies.length === 0 ? (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 mb-2">No supplies found.</div>
                  ) : (
                    <ul className="bg-gray-100 dark:bg-gray-800 rounded p-2 mb-2">
                      {supplies.map((supply: any) => (
                        <li key={supply.id} className="mb-1">
                          <span className="font-medium">{supply.name || supply.type || 'Supply'}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => { setShowContent(false); setContentUser(null); }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEdit && editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <div className="space-y-3">
              <input className="w-full border p-2 rounded" placeholder="Name" value={editUser.name || ''} onChange={e => setEditUser({ ...editUser, name: e.target.value })} />
              <input className="w-full border p-2 rounded" placeholder="Email" value={editUser.email || ''} onChange={e => setEditUser({ ...editUser, email: e.target.value })} />
              <input className="w-full border p-2 rounded" placeholder="Phone" value={editUser.phone || ''} onChange={e => setEditUser({ ...editUser, phone: e.target.value })} />
              <input className="w-full border p-2 rounded" placeholder="Password (leave blank to keep)" type="password" onChange={e => setEditUser({ ...editUser, password: e.target.value })} />
              <select className="w-full border p-2 rounded" value={editUser.role || 'farmer'} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                <option value="farmer">Farmer</option>
                <option value="owner">Owner</option>
                <option value="supplier">Supplier</option>
              </select>
            </div>
            {actionError && <div className="text-red-600 mt-2">{actionError}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => { setShowEdit(false); setEditUser(null); }}>Cancel</button>
              <button className="px-4 py-2 rounded bg-green-700 text-white" onClick={submitEdit} disabled={actionLoading}>{actionLoading ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add User</h3>
            <div className="space-y-3">
              <input className="w-full border p-2 rounded" placeholder="Name" value={addUser.name || ''} onChange={e => setAddUser({ ...addUser, name: e.target.value })} />
              <input className="w-full border p-2 rounded" placeholder="Email" value={addUser.email || ''} onChange={e => setAddUser({ ...addUser, email: e.target.value })} />
              <input className="w-full border p-2 rounded" placeholder="Phone" value={addUser.phone || ''} onChange={e => setAddUser({ ...addUser, phone: e.target.value })} />
              <input className="w-full border p-2 rounded" placeholder="Password" type="password" value={addUser.password || ''} onChange={e => setAddUser({ ...addUser, password: e.target.value })} />
              <select className="w-full border p-2 rounded" value={addUser.role || 'farmer'} onChange={e => setAddUser({ ...addUser, role: e.target.value })}>
                <option value="farmer">Farmer</option>
                <option value="owner">Owner</option>
                <option value="supplier">Supplier</option>
              </select>
            </div>
            {actionError && <div className="text-red-600 mt-2">{actionError}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => { setShowAdd(false); setAddUser({ ...emptyUser }); }}>Cancel</button>
              <button className="px-4 py-2 rounded bg-green-700 text-white" onClick={submitAdd} disabled={actionLoading}>{actionLoading ? 'Adding...' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      {showDelete && deleteUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Delete User</h3>
            <p>Are you sure you want to delete this user?</p>
            {actionError && <div className="text-red-600 mt-2">{actionError}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => { setShowDelete(false); setDeleteUserId(null); }}>Cancel</button>
              <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={() => handleDelete(deleteUserId)} disabled={actionLoading}>{actionLoading ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Equipment Confirmation */}
      {showDeleteEquipment && deleteEquipmentId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Delete Equipment</h3>
            <p>Are you sure you want to delete this equipment?</p>
            {actionError && <div className="text-red-600 mt-2">{actionError}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => { setShowDeleteEquipment(false); setDeleteEquipmentId(null); }}>Cancel</button>
              <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={() => handleDeleteEquipment(deleteEquipmentId)} disabled={actionLoading}>{actionLoading ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Supply Confirmation */}
      {showDeleteSupply && deleteSupplyId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Delete Supply</h3>
            <p>Are you sure you want to delete this supply?</p>
            {actionError && <div className="text-red-600 mt-2">{actionError}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => { setShowDeleteSupply(false); setDeleteSupplyId(null); }}>Cancel</button>
              <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={() => handleDeleteSupply(deleteSupplyId)} disabled={actionLoading}>{actionLoading ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {showEditEquipment && editEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Equipment</h3>
            <div className="space-y-3">
              <input
                className="w-full border p-2 rounded"
                placeholder="Equipment Name"
                value={editEquipment.name || ''}
                onChange={e => setEditEquipment({ ...editEquipment, name: e.target.value })}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Type"
                value={editEquipment.type || ''}
                onChange={e => setEditEquipment({ ...editEquipment, type: e.target.value })}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Price"
                type="number"
                value={editEquipment.price || ''}
                onChange={e => setEditEquipment({ ...editEquipment, price: parseFloat(e.target.value) || 0 })}
              />
              <textarea
                className="w-full border p-2 rounded"
                placeholder="Description"
                value={editEquipment.description || ''}
                onChange={e => setEditEquipment({ ...editEquipment, description: e.target.value })}
                rows={3}
              />
              <select
                className="w-full border p-2 rounded"
                value={editEquipment.ownerId || ''}
                onChange={e => setEditEquipment({ ...editEquipment, ownerId: e.target.value })}
              >
                <option value="">Select Owner</option>
                {users.filter(user => user.role === 'owner').map(owner => (
                  <option key={owner.id} value={owner.id}>{owner.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={editEquipment.available || false}
                  onChange={e => setEditEquipment({ ...editEquipment, available: e.target.checked })}
                />
                <label htmlFor="available">Available for rent</label>
              </div>
            </div>
            {actionError && <div className="text-red-600 mt-2">{actionError}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 rounded bg-gray-200"
                onClick={() => { setShowEditEquipment(false); setEditEquipment(null); }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-green-700 text-white"
                onClick={submitEditEquipment}
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Supply Modal */}
      {showEditSupply && editSupply && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Supply</h3>
            <div className="space-y-3">
              <input
                className="w-full border p-2 rounded"
                placeholder="Supply Name"
                value={editSupply.name || ''}
                onChange={e => setEditSupply({ ...editSupply, name: e.target.value })}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Category"
                value={editSupply.category || ''}
                onChange={e => setEditSupply({ ...editSupply, category: e.target.value })}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Brand"
                value={editSupply.brand || ''}
                onChange={e => setEditSupply({ ...editSupply, brand: e.target.value })}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Price"
                type="number"
                value={editSupply.price || ''}
                onChange={e => setEditSupply({ ...editSupply, price: parseFloat(e.target.value) || 0 })}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Unit (kg, liter, etc.)"
                value={editSupply.unit || ''}
                onChange={e => setEditSupply({ ...editSupply, unit: e.target.value })}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Quantity"
                type="number"
                value={editSupply.quantity || ''}
                onChange={e => setEditSupply({ ...editSupply, quantity: parseInt(e.target.value) || 0 })}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Expiry Date"
                type="date"
                value={editSupply.expiryDate ? editSupply.expiryDate.split('T')[0] : ''}
                onChange={e => setEditSupply({ ...editSupply, expiryDate: e.target.value })}
              />
              <textarea
                className="w-full border p-2 rounded"
                placeholder="Description"
                value={editSupply.description || ''}
                onChange={e => setEditSupply({ ...editSupply, description: e.target.value })}
                rows={3}
              />
              <select
                className="w-full border p-2 rounded"
                value={editSupply.supplierId || ''}
                onChange={e => setEditSupply({ ...editSupply, supplierId: e.target.value })}
              >
                <option value="">Select Supplier</option>
                {users.filter(user => user.role === 'supplier').map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="supplyAvailable"
                  checked={editSupply.available || false}
                  onChange={e => setEditSupply({ ...editSupply, available: e.target.checked })}
                />
                <label htmlFor="supplyAvailable">Available for order</label>
              </div>
            </div>
            {actionError && <div className="text-red-600 mt-2">{actionError}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 rounded bg-gray-200"
                onClick={() => { setShowEditSupply(false); setEditSupply(null); }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-green-700 text-white"
                onClick={submitEditSupply}
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;