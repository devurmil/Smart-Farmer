import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

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

const emptyUser: UserForm = { name: '', email: '', phone: '', role: 'farmer', password: '' };

const AdminPage: React.FC = () => {
  const { token } = useAuth();
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
  const [showContent, setShowContent] = useState(false);
  const [contentUser, setContentUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users', {
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
      const res = await fetch(`/api/users/${id}`, {
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
      const res = await fetch(`/api/users/${editUser.id}`, {
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
      const res = await fetch('/api/users', {
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

  return (
    <div className="main-bg min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
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

      {/* User Content Modal */}
      {showContent && contentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-semibold mb-4">User Content: {contentUser.name}</h3>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Farms</h4>
              <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 mb-2">(Farms list will appear here)</div>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Equipment</h4>
              <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 mb-2">(Equipment list will appear here)</div>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Supply List</h4>
              <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 mb-2">(Supply list will appear here)</div>
            </div>
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
    </div>
  );
};

export default AdminPage; 