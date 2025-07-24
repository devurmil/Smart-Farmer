import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getBackendUrl } from '@/lib/utils';

const EditEquipmentModal = ({ equipment, onClose, onEquipmentUpdated, isAdmin = false }) => {
  const [form, setForm] = useState({
    name: equipment.name || '',
    type: equipment.type || '',
    price: equipment.price || '',
    description: equipment.description || '',
    available: equipment.available || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${getBackendUrl()}/api/equipment/${equipment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Failed to update equipment');
      setSuccess('Equipment updated successfully!');
      if (onEquipmentUpdated) onEquipmentUpdated();
    } catch (err) {
      setError(err.message || 'Failed to update equipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4">Edit Equipment</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Input id="type" name="type" value={form.type} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="price">Price (₹/day)</Label>
            <Input id="price" name="price" type="number" value={form.price} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3} />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="available"
              name="available"
              type="checkbox"
              checked={form.available}
              onChange={handleChange}
            />
            <Label htmlFor="available">Available</Label>
          </div>
          <div className="flex gap-4 mt-6">
            <Button type="submit" className="bg-blue-600 text-white" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEquipmentModal; 