import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getBackendUrl } from '@/lib/utils';

const ProfileSettings = () => {
  const { user, updateUser, logout } = useUser();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profilePicture: user?.profilePicture || '',
    password: '', // for delete
    newProfilePicture: null as File | null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture' && files && files[0]) {
      setForm((prev) => ({ ...prev, newProfilePicture: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      if (form.newProfilePicture) {
        formData.append('profilePicture', form.newProfilePicture);
      }
      const res = await fetch(`${getBackendUrl()}/api/auth/user/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('smartFarmToken') || ''}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to update profile');
      } else {
        setSuccess('Profile updated successfully!');
        updateUser(data.user);
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form.password) {
      setError('Please enter your password to delete your profile.');
      return;
    }
    setIsDeleting(true);
    setError('');
    try {
      const res = await fetch(`${getBackendUrl()}/api/auth/user/profile`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('smartFarmToken') || ''}`,
        },
        body: JSON.stringify({ password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to delete profile');
      } else {
        logout();
      }
    } catch (err) {
      setError('Failed to delete profile');
    } finally {
      setIsDeleting(false);
    }
  };

  // Switch account logic (simple version)
  const handleSwitchAccount = () => {
    setShowSwitch(true);
    // You can implement a modal or redirect to login page for switching
    logout();
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input name="phone" value={form.phone} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="profilePicture">Profile Picture</Label>
          <Input name="profilePicture" type="file" accept="image/*" onChange={handleChange} />
          {form.profilePicture && (
            <img src={form.profilePicture} alt="Profile" className="w-16 h-16 rounded-full mt-2" />
          )}
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
      <div className="mt-8 border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Danger Zone</h3>
        <Label htmlFor="password">Password (for delete)</Label>
        <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Enter password to delete" />
        <Button variant="destructive" className="w-full mt-2" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Delete Profile'}
        </Button>
      </div>
      <div className="mt-8 border-t pt-4">
        <Button variant="outline" className="w-full" onClick={handleSwitchAccount}>
          Switch Account
        </Button>
        {showSwitch && <div className="text-sm text-gray-600 mt-2">You have been logged out. Please log in with another account.</div>}
      </div>
    </div>
  );
};

export default ProfileSettings; 