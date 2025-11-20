import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { getBackendUrl } from '@/lib/utils';
import AddEquipmentForm from '../components/AddEquipmentForm';
import AddSupplyForm from '../components/AddSupplyForm';
import {
  Users,
  Wrench,
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Activity,
  BarChart3,
  Settings,
  Search,
  Filter,
  Calendar,
  DollarSign,
  ShoppingCart,
  UserCheck,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

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

const resolveId = (value: any, fallback: string = ''): string => {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return (
    value.id ||
    value._id ||
    value.userId ||
    value.ownerId ||
    value.supplierId ||
    fallback
  );
};

const AdminPage: React.FC = () => {
  const { user, token } = useUser();
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
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  // Content management state
  const [showContent, setShowContent] = useState(false);
  const [contentUser, setContentUser] = useState<User | null>(null);
  const [farms, setFarms] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [supplies, setSupplies] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  // All data loaded at once
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

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [supplyFilter, setSupplyFilter] = useState('');

  const buildAuthHeaders = (extraHeaders: Record<string, string> = {}) => {
    const headers: Record<string, string> = { ...extraHeaders };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getBackendUrl()}/api/users`, {
        credentials: 'include',
        headers: buildAuthHeaders(),
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

  // Load all data on component mount
  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchAllEquipment();
      fetchAllSupplies();
    }
  }, [user]);

  // Delete user
  const handleDelete = async (id: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`${getBackendUrl()}/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildAuthHeaders(),
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
    setActionError(null);
    setActionSuccess(null);
  };
  const submitEdit = async () => {
    if (!editUser || !editUser.id) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch(`${getBackendUrl()}/api/users/${editUser.id}`, {
        method: 'PUT',
        headers: buildAuthHeaders({
          'Content-Type': 'application/json',
        }),
        credentials: 'include',
        body: JSON.stringify({
          name: editUser.name,
          email: editUser.email,
          phone: editUser.phone,
          role: editUser.role,
          password: editUser.password,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to update user');
      
      // Show success message
      const passwordChanged = editUser.password && editUser.password.trim() !== '';
      const successMessage = passwordChanged 
        ? 'User updated successfully. Password has been changed.'
        : 'User updated successfully.';
      setActionSuccess(successMessage);
      
      // Clear the form after a short delay
      setTimeout(() => {
        setShowEdit(false);
        setEditUser(null);
        setActionSuccess(null);
        fetchUsers();
      }, 1500);
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
        headers: buildAuthHeaders({
          'Content-Type': 'application/json',
        }),
        credentials: 'include',
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
        credentials: 'include',
        headers: buildAuthHeaders(),
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
        credentials: 'include',
        headers: buildAuthHeaders(),
      });
      const data = await res.json();
      
      // Handle the new structured response
      if (data.success) {
        // Fetch supplier details for each supply
        const suppliesWithSuppliers = await Promise.all(
          (data.data || []).map(async (supply: Supply) => {
            const supplierId = resolveId(supply.supplierId || supply.supplier);
            if (!supplierId) {
              return { ...supply, supplier: null };
            }
            try {
              const supplierRes = await fetch(`${getBackendUrl()}/api/users/${supplierId}`, {
                credentials: 'include',
                headers: buildAuthHeaders(),
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
    const normalizedOwnerId = resolveId(equipment.ownerId || equipment.owner, '');
    setEditEquipment({ ...equipment, ownerId: normalizedOwnerId });
    setShowEditEquipment(true);
  };

  const submitEditEquipment = async () => {
    if (!editEquipment || !editEquipment.id) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`${getBackendUrl()}/api/equipment/${editEquipment.id}`, {
        method: 'PUT',
        headers: buildAuthHeaders({
          'Content-Type': 'application/json',
        }),
        credentials: 'include',
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
        credentials: 'include',
        headers: buildAuthHeaders(),
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
        credentials: 'include',
        headers: buildAuthHeaders(),
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
    const normalizedSupplierId = resolveId(supply.supplierId || supply.supplier, '');
    setEditSupply({ ...supply, supplierId: normalizedSupplierId });
    setShowEditSupply(true);
  };

  const submitEditSupply = async () => {
    if (!editSupply || !editSupply.id) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`${getBackendUrl()}/api/supplies/${editSupply.id}`, {
        method: 'PUT',
        headers: buildAuthHeaders({
          'Content-Type': 'application/json',
        }),
        credentials: 'include',
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


  // Fetch user content when modal opens
  useEffect(() => {
    const fetchContent = async () => {
      if (!showContent || !contentUser) return;
      setContentLoading(true);
      setContentError(null);
      try {
        // Fetch farms
        const contentUserId = encodeURIComponent(resolveId(contentUser, ''));
        const farmsRes = await fetch(`${getBackendUrl()}/api/farms?user_id=${contentUserId}`, {
          credentials: 'include',
          headers: buildAuthHeaders(),
        });
        const farmsData = await farmsRes.json();
        if (!farmsData.success) {
          console.error('Farms API error:', farmsData.message);
        }
        setFarms(farmsData.data?.farms || []);
        
        // Fetch equipment
        const equipRes = await fetch(`${getBackendUrl()}/api/equipment?user_id=${contentUserId}`, {
          credentials: 'include',
          headers: buildAuthHeaders(),
        });
        const equipData = await equipRes.json();
        console.log('Equipment API response:', equipData);
        if (!equipData.success) {
          console.error('Equipment API error:', equipData.message);
        }
        // Fix: equipment data is directly in equipData.data, not equipData.data.equipment
        const equipmentData = equipData.data || [];
        console.log('Equipment data to set:', equipmentData);
        setEquipment(equipmentData);
        
        // Fetch supplies
        const supplyRes = await fetch(`${getBackendUrl()}/api/supplies?user_id=${contentUserId}`, {
          credentials: 'include',
          headers: buildAuthHeaders(),
        });
        const supplyData = await supplyRes.json();
        console.log('Supplies API response:', supplyData);
        if (!supplyData.success) {
          console.error('Supplies API error:', supplyData.message);
        }
        // Fix: supplies data is directly in supplyData.data, not supplyData.data.supplies
        const suppliesData = supplyData.data || [];
        console.log('Supplies data to set:', suppliesData);
        setSupplies(suppliesData);
      } catch (err: any) {
        console.error('Error fetching user content:', err);
        setContentError(err.message || 'Error fetching user content');
      } finally {
        setContentLoading(false);
      }
    };
    fetchContent();
  }, [showContent, contentUser]);

  // Statistics calculations
  const totalUsers = users.length;
  const totalEquipment = allEquipment.length;
  const totalSupplies = allSupplies.length;
  const activeUsers = users.filter(user => user.role !== undefined).length;
  const availableEquipment = allEquipment.filter(eq => eq.available).length;
  const availableSupplies = allSupplies.filter(supply => supply.available).length;

  // Filtered data based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredEquipment = allEquipment.filter(equipment => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !equipmentFilter || equipment.type === equipmentFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredSupplies = allSupplies.filter(supply => {
    const matchesSearch = supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supply.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !supplyFilter || supply.category === supplyFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your Smart Farm platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                <p className="text-xs text-green-600">+{activeUsers} active</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Equipment</p>
                <p className="text-2xl font-bold text-gray-900">{totalEquipment}</p>
                <p className="text-xs text-green-600">{availableEquipment} available</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Wrench className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Supplies</p>
                <p className="text-2xl font-bold text-gray-900">{totalSupplies}</p>
                <p className="text-xs text-green-600">{availableSupplies} available</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{(allEquipment.reduce((sum, eq) => sum + eq.price, 0) + allSupplies.reduce((sum, supply) => sum + supply.price, 0)).toLocaleString()}</p>
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users Management */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-white" />
                    <h2 className="text-lg font-semibold text-white">User Management</h2>
                  </div>
                  <button
                    onClick={() => setShowAdd(true)}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-2 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add User</span>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Roles</option>
                    <option value="farmer">Farmer</option>
                    <option value="owner">Owner</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-4">
                      <Activity className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">Loading users...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-4">
                      <AlertTriangle className="h-6 w-6 mx-auto text-red-500" />
                      <p className="text-sm text-red-500 mt-2">{error}</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div key={resolveId(user, user.email)} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'farmer' ? 'bg-green-100 text-green-800' :
                                user.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                                user.role === 'supplier' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role || 'User'}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => { 
                                console.log('Opening content modal for user:', user);
                                setShowContent(true); 
                                setContentUser(user); 
                              }}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                              title="View Content"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => { setShowDelete(true); setDeleteUserId(user.id); }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Equipment Management */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Wrench className="h-6 w-6 text-white" />
                    <h2 className="text-lg font-semibold text-white">Equipment Management</h2>
                  </div>
                  <button
                    onClick={() => setShowAddEquipment(true)}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-2 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Equipment</span>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <select
                    value={equipmentFilter}
                    onChange={(e) => setEquipmentFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="Tractor">Tractor</option>
                    <option value="Harvester">Harvester</option>
                    <option value="Planter">Planter</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {equipmentLoading ? (
                    <div className="text-center py-4">
                      <Activity className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">Loading equipment...</p>
                    </div>
                  ) : equipmentError ? (
                    <div className="text-center py-4">
                      <AlertTriangle className="h-6 w-6 mx-auto text-red-500" />
                      <p className="text-sm text-red-500 mt-2">{equipmentError}</p>
                    </div>
                  ) : (
                    filteredEquipment.map((equipment) => (
                      <div key={resolveId(equipment, equipment.name)} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {equipment.imageUrl ? (
                              <img src={equipment.imageUrl} alt={equipment.name} className="w-12 h-12 object-cover rounded-lg" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Wrench className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{equipment.name}</h3>
                            <p className="text-sm text-gray-500">{equipment.type}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm font-medium text-green-600">₹{equipment.price}/day</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                equipment.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {equipment.available ? 'Available' : 'Unavailable'}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditEquipment(equipment)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => { setShowDeleteEquipment(true); setDeleteEquipmentId(equipment.id); }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Supply Management */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Package className="h-6 w-6 text-white" />
                    <h2 className="text-lg font-semibold text-white">Supply Management</h2>
                  </div>
                  <button
                    onClick={() => setShowAddSupply(true)}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-2 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Supply</span>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <select
                    value={supplyFilter}
                    onChange={(e) => setSupplyFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    <option value="seeds">Seeds</option>
                    <option value="fertilizers">Fertilizers</option>
                    <option value="pesticides">Pesticides</option>
                    <option value="tools">Tools</option>
                  </select>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {suppliesLoading ? (
                    <div className="text-center py-4">
                      <Activity className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">Loading supplies...</p>
                    </div>
                  ) : suppliesError ? (
                    <div className="text-center py-4">
                      <AlertTriangle className="h-6 w-6 mx-auto text-red-500" />
                      <p className="text-sm text-red-500 mt-2">{suppliesError}</p>
                    </div>
                  ) : (
                    filteredSupplies.map((supply) => (
                      <div key={resolveId(supply, supply.name)} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {supply.imageUrl ? (
                              <img src={supply.imageUrl} alt={supply.name} className="w-12 h-12 object-cover rounded-lg" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{supply.name}</h3>
                            <p className="text-sm text-gray-500 capitalize">{supply.category}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm font-medium text-purple-600">₹{supply.price}/{supply.unit}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                supply.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {supply.available ? 'Available' : 'Unavailable'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Qty: {supply.quantity} {supply.unit}</p>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditSupply(supply)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => { setShowDeleteSupply(true); setDeleteSupplyId(supply.id); }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Add Equipment Modal */}
      {showAddEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all"
              onClick={() => setShowAddEquipment(false)}
            >
              <Plus className="h-5 w-5 rotate-45" />
            </button>
            <AddEquipmentForm
              isAdmin={true}
              owners={users.filter(user => user.role === 'owner')}
              onClose={() => setShowAddEquipment(false)}
              onEquipmentAdded={fetchAllEquipment}
            />
          </div>
        </div>
      )}

      {/* Add Supply Modal */}
      {showAddSupply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all"
              onClick={() => setShowAddSupply(false)}
            >
              <Plus className="h-5 w-5 rotate-45" />
            </button>
            <AddSupplyForm
              isAdmin={true}
              suppliers={users.filter(user => user.role === 'supplier')}
              onClose={() => setShowAddSupply(false)}
              onSupplyAdded={() => {
                setShowAddSupply(false);
                fetchAllSupplies();
              }}
            />
          </div>
        </div>
      )}

      {/* User Content Modal */}
      {showContent && contentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all"
              onClick={() => { setShowContent(false); setContentUser(null); }}
            >
              <Plus className="h-5 w-5 rotate-45" />
            </button>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">User Content: {contentUser.name}</h3>
              <p className="text-gray-500">{contentUser.email}</p>
            </div>
            {contentLoading ? (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="text-gray-500 mt-4">Loading content...</p>
              </div>
            ) : contentError ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-8 w-8 mx-auto text-red-500" />
                <p className="text-red-500 mt-4">{contentError}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Farms ({farms.length})
                  </h4>
                  {farms.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-blue-600">No farms found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {farms.map((farm: any) => (
                        <div key={resolveId(farm, farm.name)} className="bg-white rounded p-3">
                          <p className="font-medium text-gray-900">{farm.name}</p>
                          <p className="text-sm text-gray-500">{farm.location?.address || 'No address'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-4 flex items-center">
                    <Wrench className="h-5 w-5 mr-2" />
                    Equipment ({equipment.length})
                  </h4>
                  {equipment.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-green-600">No equipment found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {equipment.map((eq: any) => (
                        <div key={resolveId(eq, eq.name)} className="bg-white rounded p-3">
                          <p className="font-medium text-gray-900">{eq.name || eq.type || 'Equipment'}</p>
                          <p className="text-sm text-gray-500">{eq.type}</p>
                          <p className="text-sm text-green-600">₹{eq.price}/day</p>
                          <p className="text-xs text-gray-400">{eq.available ? 'Available' : 'Unavailable'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-purple-900 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Supplies ({supplies.length})
                  </h4>
                  {supplies.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-purple-600">No supplies found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {supplies.map((supply: any) => (
                        <div key={resolveId(supply, supply.name)} className="bg-white rounded p-3">
                          <p className="font-medium text-gray-900">{supply.name || supply.type || 'Supply'}</p>
                          <p className="text-sm text-gray-500 capitalize">{supply.category}</p>
                          <p className="text-sm text-purple-600">₹{supply.price}/{supply.unit}</p>
                          <p className="text-xs text-gray-400">Qty: {supply.quantity} {supply.unit}</p>
                          <p className="text-xs text-gray-400">{supply.available ? 'Available' : 'Unavailable'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEdit && editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all"
              onClick={() => { setShowEdit(false); setEditUser(null); }}
            >
              <Plus className="h-5 w-5 rotate-45" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full Name"
                  value={editUser.name || ''}
                  onChange={e => setEditUser({ ...editUser, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email Address"
                  value={editUser.email || ''}
                  onChange={e => setEditUser({ ...editUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Phone Number"
                  value={editUser.phone || ''}
                  onChange={e => setEditUser({ ...editUser, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password (leave blank to keep current)"
                  type="password"
                  onChange={e => setEditUser({ ...editUser, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={editUser.role || 'farmer'}
                  onChange={e => setEditUser({ ...editUser, role: e.target.value })}
                >
                  <option value="farmer">Farmer</option>
                  <option value="owner">Owner</option>
                  <option value="supplier">Supplier</option>
                </select>
              </div>
            </div>
            {actionError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{actionError}</p>
              </div>
            )}
            {actionSuccess && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">{actionSuccess}</p>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => { setShowEdit(false); setEditUser(null); setActionSuccess(null); setActionError(null); }}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={submitEdit}
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all"
              onClick={() => { setShowAdd(false); setAddUser({ ...emptyUser }); }}
            >
              <Plus className="h-5 w-5 rotate-45" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Full Name"
                  value={addUser.name || ''}
                  onChange={e => setAddUser({ ...addUser, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Email Address"
                  value={addUser.email || ''}
                  onChange={e => setAddUser({ ...addUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Phone Number"
                  value={addUser.phone || ''}
                  onChange={e => setAddUser({ ...addUser, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Password"
                  type="password"
                  value={addUser.password || ''}
                  onChange={e => setAddUser({ ...addUser, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={addUser.role || 'farmer'}
                  onChange={e => setAddUser({ ...addUser, role: e.target.value })}
                >
                  <option value="farmer">Farmer</option>
                  <option value="owner">Owner</option>
                  <option value="supplier">Supplier</option>
                </select>
              </div>
            </div>
            {actionError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{actionError}</p>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => { setShowAdd(false); setAddUser({ ...emptyUser }); }}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                onClick={submitAdd}
                disabled={actionLoading}
              >
                {actionLoading ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modals */}
      {showDelete && deleteUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm relative">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
              {actionError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{actionError}</p>
                </div>
              )}
              <div className="flex justify-center gap-3">
                <button
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => { setShowDelete(false); setDeleteUserId(null); }}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  onClick={() => handleDelete(deleteUserId)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteEquipment && deleteEquipmentId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm relative">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Equipment</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this equipment? This action cannot be undone.</p>
              {actionError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{actionError}</p>
                </div>
              )}
              <div className="flex justify-center gap-3">
                <button
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => { setShowDeleteEquipment(false); setDeleteEquipmentId(null); }}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  onClick={() => handleDeleteEquipment(deleteEquipmentId)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteSupply && deleteSupplyId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm relative">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Supply</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this supply? This action cannot be undone.</p>
              {actionError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{actionError}</p>
                </div>
              )}
              <div className="flex justify-center gap-3">
                <button
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => { setShowDeleteSupply(false); setDeleteSupplyId(null); }}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  onClick={() => handleDeleteSupply(deleteSupplyId)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {showEditEquipment && editEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all"
              onClick={() => { setShowEditEquipment(false); setEditEquipment(null); }}
            >
              <Plus className="h-5 w-5 rotate-45" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Edit Equipment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Name</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Equipment Name"
                  value={editEquipment.name || ''}
                  onChange={e => setEditEquipment({ ...editEquipment, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Type"
                  value={editEquipment.type || ''}
                  onChange={e => setEditEquipment({ ...editEquipment, type: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹/day)</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Price"
                  type="number"
                  value={editEquipment.price || ''}
                  onChange={e => setEditEquipment({ ...editEquipment, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Description"
                  value={editEquipment.description || ''}
                  onChange={e => setEditEquipment({ ...editEquipment, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Owner</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editEquipment.ownerId || ''}
                  onChange={e => setEditEquipment({ ...editEquipment, ownerId: e.target.value })}
                >
                  <option value="">Select Owner</option>
                  {users.filter(user => user.role === 'owner').map(owner => {
                    const ownerValue = resolveId(owner, owner.email || owner.name);
                    return (
                      <option key={ownerValue} value={ownerValue}>
                        {owner.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="equipmentAvailable"
                  checked={editEquipment.available || false}
                  onChange={e => setEditEquipment({ ...editEquipment, available: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="equipmentAvailable" className="text-sm font-medium text-gray-700">Available for rent</label>
              </div>
            </div>
            {actionError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{actionError}</p>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => { setShowEditEquipment(false); setEditEquipment(null); }}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all"
              onClick={() => { setShowEditSupply(false); setEditSupply(null); }}
            >
              <Plus className="h-5 w-5 rotate-45" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Edit Supply</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supply Name</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Supply Name"
                  value={editSupply.name || ''}
                  onChange={e => setEditSupply({ ...editSupply, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Category"
                  value={editSupply.category || ''}
                  onChange={e => setEditSupply({ ...editSupply, category: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brand"
                  value={editSupply.brand || ''}
                  onChange={e => setEditSupply({ ...editSupply, brand: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Price"
                    type="number"
                    value={editSupply.price || ''}
                    onChange={e => setEditSupply({ ...editSupply, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Unit"
                    value={editSupply.unit || ''}
                    onChange={e => setEditSupply({ ...editSupply, unit: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Quantity"
                  type="number"
                  value={editSupply.quantity || ''}
                  onChange={e => setEditSupply({ ...editSupply, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  type="date"
                  value={editSupply.expiryDate ? editSupply.expiryDate.split('T')[0] : ''}
                  onChange={e => setEditSupply({ ...editSupply, expiryDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Description"
                  value={editSupply.description || ''}
                  onChange={e => setEditSupply({ ...editSupply, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={editSupply.supplierId || ''}
                  onChange={e => setEditSupply({ ...editSupply, supplierId: e.target.value })}
                >
                  <option value="">Select Supplier</option>
                  {users.filter(user => user.role === 'supplier').map(supplier => {
                    const supplierValue = resolveId(supplier, supplier.email || supplier.name);
                    return (
                      <option key={supplierValue} value={supplierValue}>
                        {supplier.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="supplyAvailable"
                  checked={editSupply.available || false}
                  onChange={e => setEditSupply({ ...editSupply, available: e.target.checked })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="supplyAvailable" className="text-sm font-medium text-gray-700">Available for order</label>
              </div>
            </div>
            {actionError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{actionError}</p>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => { setShowEditSupply(false); setEditSupply(null); }}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
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